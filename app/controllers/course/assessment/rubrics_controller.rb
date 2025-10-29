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

  def destroy
    @rubric.destroy!
  end

  def rubric_answers
    head :not_found and return unless @question.specific.is_a?(Course::Assessment::Question::RubricBasedResponse)

    @answers = @question.answers.without_attempting_state.includes({ submission: { creator: :course_users } })
  end

  def fetch_answer_evaluations
    @answer_evaluations = @rubric.answer_evaluations.includes(answer: { submission: :creator })
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

  def evaluate_answer # rubocop:disable Metrics/AbcSize
    answer = @question.answers.find(params.permit(:answer_id)[:answer_id])
    head :bad_request unless answer&.specific.is_a?(Course::Assessment::Answer::RubricBasedResponse)

    @answer_evaluation =
      @rubric.answer_evaluations.find_by(answer: answer) ||
      Course::Rubric::AnswerEvaluation.create({
        rubric: @rubric,
        answer: answer
      })

    question_adapter = Course::Assessment::Question::QuestionAdapter.new(answer.question)
    rubric_adapter = Course::Rubric::RubricAdapter.new(@rubric)
    answer_adapter = Course::Assessment::Answer::RubricPlaygroundAnswerAdapter.new(answer, @answer_evaluation)

    llm_response = Course::Rubric::LlmService.new(question_adapter, rubric_adapter, answer_adapter).evaluate
    answer_adapter.save_llm_results(llm_response)

    render partial: 'course/rubrics/answer_evaluation', locals: { answer_evaluation: @answer_evaluation }
  end

  def delete_answer_evaluations
    answer_evaluation = @rubric.answer_evaluations.find_by(answer_id: params.permit(:answer_id)[:answer_id])
    answer_evaluation&.destroy!
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

  def export_evaluations
    job = Course::Rubric::RubricEvaluationExportJob.perform_later(
      current_course, @rubric.id, @question.id
    ).job
    render partial: 'jobs/submitted', locals: { job: job }
  end

  private

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
end
