# frozen_string_literal: true
class Course::Assessment::Question::ProgrammingController < Course::Assessment::Question::Controller
  include Course::Assessment::Question::KoditsuQuestionConcern

  build_and_authorize_new_question :programming_question,
                                   class: Course::Assessment::Question::Programming, only: [:new, :create]
  load_and_authorize_resource :programming_question,
                              class: 'Course::Assessment::Question::Programming',
                              through: :assessment, parent: false,
                              except: [:new, :create, :generate, :codaveri_languages]
  before_action :load_question_assessment, only: [:edit, :update, :update_question_setting]
  before_action :set_attributes_for_programming_question, except: [:generate, :codaveri_languages]

  def new
    respond_to do |format|
      format.json { format_test_cases }
    end
  end

  def create
    @programming_question.package_type = programming_question_params.key?(:file) ? :zip_upload : :online_editor
    @programming_question.current = @programming_question
    process_package

    if @programming_question.save
      load_question_assessment

      render_success_json true
    else
      render_failure_json
    end
  end

  def edit
    respond_to do |format|
      format.json do
        @meta = programming_package_service.extract_meta if @programming_question.edit_online?
        format_test_cases
      end
    end
  end

  def update
    result = @programming_question.class.transaction do
      old_update_timestamp = @programming_question.snapshot_of_state_at

      # Duplicate the original question as a snapshot
      snapshot = @programming_question.dup
      snapshot.current = @programming_question

      snapshot.template_files = @programming_question.template_files.map do |template_file|
        duplicated_template_file = template_file.dup
        duplicated_template_file.question = snapshot
        duplicated_template_file
      end

      snapshot.test_cases = @programming_question.test_cases.map do |test_case|
        duplicated_test_case = test_case.dup
        duplicated_test_case.question = snapshot

        # Test case results aren't duplicated by default, so we do that now
        duplicated_test_case.test_results = test_case.test_results.map(&:dup) if test_case.test_results.any?
        duplicated_test_case
      end

      @question_assessment.skill_ids = programming_question_params[:question_assessment].
                                       try(:[], :skill_ids)
      @programming_question.assign_attributes(programming_question_params.
                                              except(:question_assessment))
      @programming_question.is_synced_with_codaveri = false
      process_package

      update_timestamp = Time.current
      @programming_question.updated_at = update_timestamp
      @programming_question.snapshot_of_state_at = update_timestamp
      @programming_question.snapshot_index = @programming_question.snapshot_index + 1

      raise ActiveRecord::Rollback unless @programming_question.save

      if @programming_question.should_create_snapshot?
        @programming_question.update_column(:import_job_id, nil) # maintains uniqueness constraint
        snapshot.skip_process_package = true
        snapshot.save!

        update_result = ActiveRecord::Base.connection.execute(<<-SQL.squish
          UPDATE course_assessment_answer_programming_auto_gradings
          SET question_snapshot_id = #{snapshot.id}
          FROM course_assessment_answer_auto_gradings, course_assessment_answers, course_assessment_questions
          WHERE course_assessment_answer_programming_auto_gradings.id = course_assessment_answer_auto_gradings.actable_id
            AND course_assessment_answer_auto_gradings.answer_id = course_assessment_answers.id
            AND course_assessment_questions.id = course_assessment_answers.question_id
            AND course_assessment_questions.actable_id = #{@programming_question.id}
            AND course_assessment_questions.actable_type = 'Course::Assessment::Question::Programming'
            AND (course_assessment_answer_programming_auto_gradings.question_snapshot_id IS NULL
                OR course_assessment_answer_programming_auto_gradings.question_snapshot_id = #{@programming_question.id})
        SQL
        )
        
      end

      true
    end

    if result
      render_success_json false
    else
      render_failure_json
    end
  end

  def import_result
    head :not_found and return if @programming_question&.import_job.nil?
  end

  def codaveri_languages
    languages = Coursemology::Polyglot::Language.
                where(enabled: true, question_generation_whitelisted: true).
                order(weight: :desc)

    render partial: 'languages', locals: { languages: languages }
  end

  def generate
    language = Coursemology::Polyglot::Language.where(id: params[:language_id]).first

    unless language.codaveri_evaluator_whitelisted?
      render json: {
        success: false,
        message: 'Language not supported'
      }, status: :bad_request
    end

    generation_service = Course::Assessment::Question::CodaveriProblemGenerationService.new(
      @assessment,
      params,
      language.extend(CodaveriLanguageConcern).codaveri_language,
      language.extend(CodaveriLanguageConcern).codaveri_version
    )

    generated_problem = generation_service.codaveri_generate_problem
    render json: generated_problem, status: :ok
  end

  def update_question_setting
    if @programming_question.update(programming_question_setting_params)
      head :ok
    else
      error = @programming_question.errors.full_messages.to_sentence
      render json: { errors: error }, status: :bad_request
    end
  end

  def destroy
    if @programming_question.destroy
      super

      head :ok
    else
      error = @programming_question.errors.full_messages.to_sentence
      render json: { errors: error }, status: :bad_request
    end
  end

  private

  def format_test_cases
    @public_test_cases = []
    @private_test_cases = []
    @evaluation_test_cases = []

    @programming_question.test_cases.each do |test_case|
      @public_test_cases << test_case if test_case.public_test?
      @private_test_cases << test_case if test_case.private_test?
      @evaluation_test_cases << test_case if test_case.evaluation_test?
    end
  end

  def set_attributes_for_programming_question
    @programming_question.max_time_limit = current_course.programming_max_time_limit
  end

  def programming_question_params
    params.require(:question_programming).permit(
      :title, :description, :staff_only_comments, :maximum_grade,
      :language_id, :memory_limit, :time_limit, :attempt_limit,
      :live_feedback_enabled, :live_feedback_custom_prompt,
      :is_low_priority, :is_codaveri, *attachment_params,
      question_assessment: { skill_ids: [] }
    )
  end

  def programming_question_setting_params
    params.require(:question_programming).permit(:is_codaveri, :live_feedback_enabled)
  end

  def render_success_json(redirect_to_edit)
    render partial: 'response', locals: { redirect_to_edit: redirect_to_edit }
  end

  def render_failure_json
    render json: { errors: @programming_question.errors.full_messages.to_sentence }, status: :bad_request
  end

  def process_package
    return unless @programming_question.edit_online?

    programming_package_service(params).generate_package
    @meta = programming_package_service(params).extract_meta
    @programming_question.multiple_file_submission = @meta[:data]['submit_as_file'] || false
  end

  def programming_package_service(params = nil)
    @service ||= Course::Assessment::Question::Programming::ProgrammingPackageService.new(
      @programming_question, params
    )
  end

  def load_question_assessment
    @question_assessment = load_question_assessment_for(@programming_question)
  end
end
