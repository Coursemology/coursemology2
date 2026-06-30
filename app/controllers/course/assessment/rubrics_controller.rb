# frozen_string_literal: true
class Course::Assessment::RubricsController < Course::Assessment::QuestionsController # rubocop:disable Metrics/ClassLength
  load_resource :rubric, class: 'Course::Rubric', through: :question, except: [:index, :rubric_answers]

  def index
    head :not_found and return unless @question.specific.is_a?(Course::Assessment::Question::RubricBasedResponse)

    if @question.rubrics.empty?
      v2_rubric = Course::Rubric.build_from_v1(@question.specific, current_course)
      v2_rubric.save!
    end

    @rubrics = @question.rubrics.includes({ categories: :criterions })
  end

  def show
    render partial: 'course/rubrics/rubric', locals: { rubric: @rubric }
  end

  def create
    @rubric.questions = [@question]
    @rubric.course = current_course
    if @rubric.save
      render partial: 'course/rubrics/rubric', locals: { rubric: @rubric }
    else
      render json: { errors: @rubric.errors }, status: :bad_request
    end
  end

  # Deletes this rubric revision from the current question. Rules:
  #   * It is the question's active rubric        -> rejected (rolled back); the active rubric can't be deleted.
  #   * No evaluations for this question's answers -> just unlink (destroy the question_rubric). If the rubric
  #     is then unused (no other questions, no evaluations at all) it is destroyed by the orphan cleanup;
  #     otherwise it (and other questions' evaluations) is left untouched.
  #   * Some evaluations for this question's answers -> keep the rubric and its evaluations, unlink it, and
  #     hide this question's visible playground evaluations. Other questions' evaluations are untouched.
  def destroy
    if @question.active_rubric_id == @rubric.id
      render json: { errors: ['Cannot delete the active rubric.'] }, status: :unprocessable_entity
      return
    end

    question_rubric = @question.question_rubrics.find_by!(rubric: @rubric)
    answer_ids = @question.answers.select(:id)

    Course::Rubric.transaction do
      @rubric.answer_evaluations.playground.where(answer_id: answer_ids).
        update_all(evaluation_type: :playground_hidden)
      # Orphan cleanup (QuestionRubric#destroy_orphaned_rubric) drops the rubric only when it is now unlinked
      # AND has no remaining evaluations.
      question_rubric.destroy!
    end
    head :ok
  end

  def rubric_answers
    head :not_found and return unless @question.specific.is_a?(Course::Assessment::Question::RubricBasedResponse)

    @answers = @question.answers.without_attempting_state.includes({ submission: { creator: :course_users } })
  end

  def fetch_answer_evaluations
    # The selected version's (non-dismissed) playground evaluations -- shown in the playground table -- plus
    # every answer's official grading evaluation (shown in the Apply table). Dismissed (playground_hidden)
    # evaluations are excluded. The frontend splits the two by evaluationType.
    @answer_evaluations = @rubric.answer_evaluations.playground.includes(answer: { submission: :creator })
    @grading_evaluations = Course::Rubric::AnswerEvaluation.grading.
                           where(answer_id: @question.answers.select(:id)).
                           includes(selections: [:criterion, :category], answer: { submission: :creator })
  end

  def fetch_mock_answer_evaluations
    @mock_answer_evaluations = @rubric.mock_answer_evaluations
  end

  def initialize_answer_evaluations
    answer_evaluations = Course::Rubric::AnswerEvaluation.insert_all(
      params.require(:answer_ids).map do |id|
        {
          rubric_id: @rubric.id,
          answer_id: id
        }
      end
    )

    render partial: 'course/rubrics/answer_evaluation',
           collection: Course::Rubric::AnswerEvaluation.where(id: answer_evaluations.map { |row| row['id'] }),
           as: :answer_evaluation
  end

  def initialize_mock_answer_evaluations
    mock_answer_evaluations = Course::Rubric::MockAnswerEvaluation.insert_all(
      params.require(:mock_answer_ids).map do |id|
        {
          rubric_id: @rubric.id,
          mock_answer_id: id
        }
      end
    )

    render partial: 'course/rubrics/mock_answer_evaluation',
           collection: Course::Rubric::MockAnswerEvaluation.where(
             id: mock_answer_evaluations.map { |row| row['id'] }
           ),
           as: :answer_evaluation
  end

  def evaluate_mock_answer
    mock_answer = @question.mock_answers.find(params.permit(:mock_answer_id)[:mock_answer_id])
    @mock_answer_evaluation =
      @rubric.mock_answer_evaluations.find_by(mock_answer: mock_answer) ||
      Course::Rubric::MockAnswerEvaluation.create({
        rubric: @rubric,
        mock_answer: mock_answer
      })

    question_adapter = Course::Assessment::Question::QuestionAdapter.new(mock_answer.question)
    rubric_adapter = Course::Rubric::RubricAdapter.new(@rubric)
    answer_adapter = Course::Assessment::Question::MockAnswer::AnswerAdapter.new(mock_answer, @mock_answer_evaluation)

    llm_response = Course::Rubric::LlmService.new(question_adapter, rubric_adapter, answer_adapter).evaluate
    answer_adapter.save_llm_results(llm_response)

    render partial: 'course/rubrics/mock_answer_evaluation', locals: { answer_evaluation: @mock_answer_evaluation }
  end

  def evaluate_answer
    answer = @question.answers.find(params.permit(:answer_id)[:answer_id])
    head :bad_request and return unless answer&.specific.is_a?(Course::Assessment::Answer::RubricBasedResponse)

    # Reuse (and un-hide) the existing playground evaluation for this (answer, rubric) if one exists, else
    # start a fresh one. Re-evaluating a dismissed answer brings it back into the table.
    @answer_evaluation = Course::Rubric::AnswerEvaluation.find_or_build_playground(answer: answer, rubric: @rubric)
    @answer_evaluation.save!

    question_adapter = Course::Assessment::Question::QuestionAdapter.new(answer.question)
    rubric_adapter = Course::Rubric::RubricAdapter.new(@rubric)
    answer_adapter = Course::Assessment::Answer::RubricPlaygroundAnswerAdapter.new(answer, @answer_evaluation)

    llm_response = Course::Rubric::LlmService.new(question_adapter, rubric_adapter, answer_adapter).evaluate
    answer_adapter.save_llm_results(llm_response)

    render partial: 'course/rubrics/answer_evaluation', locals: { answer_evaluation: @answer_evaluation }
  end

  # "Dismiss" no longer deletes the evaluation -- it hides it from the playground table (keeping the data),
  # so a later re-evaluation can bring it back.
  def delete_answer_evaluations
    answer_evaluation = @rubric.answer_evaluations.playground.find_by(answer_id: params.permit(:answer_id)[:answer_id])
    answer_evaluation&.update!(evaluation_type: :playground_hidden)
  end

  def delete_mock_answer_evaluations
    mock_answer = @question.mock_answers.find(params.permit(:mock_answer_id)[:mock_answer_id])
    mock_answer_evaluation = @rubric.mock_answer_evaluations.find_by(
      mock_answer: mock_answer
    )
    mock_answer_evaluation&.destroy!
    mock_answer.reload
    mock_answer.destroy! if mock_answer.rubric_evaluations.empty?
  end

  def apply_evaluations
    @should_apply_unevaluated = params.permit(:should_apply_unevaluated)[:should_apply_unevaluated]
    if should_raise_unevaluated_warning?
      render json: { error: 'One or more answers are unevaluated' }, status: :bad_request and return
    end

    job = Course::Rubric::ApplyEvaluationsJob.perform_later(
      current_course, @rubric.id, params.require(:answer_ids)
    ).job
    render partial: 'jobs/submitted', locals: { job: job }
  end

  # Points the question's active_rubric at this rubric and carries the graded answers' grading evaluations
  # forward to it. Mirrors the question-update pattern: the request is forwarded unconditionally, and when the
  # chosen rubric is structurally incompatible with the current active one AND there are graded answers to
  # advance, the whole change is rolled back and 409 is returned unless confirm_rubric_advance is set. The
  # frontend then confirms with the user and re-sends with confirm_rubric_advance: true.
  def set_active
    if repoint_and_advance_active_rubric == :advance_required
      render json: { error: 'rubric_advance_confirmation_required' }, status: :conflict
    else
      head :ok
    end
  end

  private

  # Repoints active_rubric_id (on the polymorphic question) at @rubric and advances graded answers to it.
  # Rolls the whole change back and returns :advance_required when the change is incompatible with graded
  # answers and confirm_rubric_advance is not set; :synced otherwise.
  def repoint_and_advance_active_rubric
    previous_active = @question.active_rubric
    advance_service = Course::Rubric::GradingEvaluationAdvanceService.new(@question.specific, @rubric)
    needs_confirmation = false

    ActiveRecord::Base.transaction do
      @question.update_column(:active_rubric_id, @rubric.id)
      if !confirm_rubric_advance? && previous_active&.incompatible_with?(@rubric) && advance_service.pending?
        needs_confirmation = true
        raise ActiveRecord::Rollback
      end
      advance_service.advance!
    end

    needs_confirmation ? :advance_required : :synced
  end

  def confirm_rubric_advance?
    ActiveRecord::Type::Boolean.new.cast(params[:confirm_rubric_advance])
  end

  def create_params
    params.permit(
      [
        :grading_prompt,
        :model_answer,
        categories_attributes: [:name, criterions_attributes: [:grade, :explanation]]
      ]
    )
  end

  def initialize_mock_answer_evaluations_params
    params.require(:mock_answer_ids)
  end

  def should_raise_unevaluated_warning?
    !ActiveRecord::Type::Boolean.new.cast(@should_apply_unevaluated) &&
      Course::Assessment::Answer.where(id: answer_ids).includes(:rubric_evaluations).any? do |answer|
        answer.rubric_evaluations.playground.find_by(rubric: @rubric).nil?
      end
  end
end
