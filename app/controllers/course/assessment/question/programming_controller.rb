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
      duplicate_and_replace_programming_question
      @question_assessment.skill_ids = programming_question_params[:question_assessment].
                                       try(:[], :skill_ids)
      @programming_question.assign_attributes(programming_question_params.
                                              except(:question_assessment))
      @programming_question.is_synced_with_codaveri = false
      process_package

      raise ActiveRecord::Rollback unless @programming_question.save

      true
    end

    if result
      render_success_json false
    else
      render_failure_json
    end
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
      language.polyglot_name,
      language.extend(CodaveriLanguageConcern).polyglot_version
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

  def duplicate_and_replace_programming_question
    duplicated_programming_question, duplicated_question = duplicate_programming_question
    duplicate_associations(duplicated_programming_question)
    save_duplicated_question(duplicated_programming_question, duplicated_question)
    link_to_original_question(duplicated_programming_question)
    @programming_question = duplicated_programming_question
  end

  def duplicate_programming_question
    duplicated_programming_question = @programming_question.dup
    duplicated_question = @programming_question.acting_as.dup
    # Unique field that needs to be reset
    duplicated_programming_question.import_job_id = nil
    duplicated_programming_question.question = @programming_question.question

    duplicated_question.koditsu_question_id = nil
    duplicated_question.is_synced_with_koditsu = false
    [duplicated_programming_question, duplicated_question]
  end

  def duplicate_associations(duplicated_programming_question)
    duplicated_programming_question.template_files = @programming_question.template_files.map do |template_file|
      duplicated_template_file = template_file.dup
      duplicated_template_file.question = duplicated_programming_question
      duplicated_template_file
    end

    duplicated_programming_question.test_cases = @programming_question.test_cases.map do |test_case|
      duplicated_test_case = test_case.dup
      duplicated_test_case.question = duplicated_programming_question
      duplicated_test_case
    end
  end

  def save_duplicated_question(duplicated_programming_question, duplicated_question)
    duplicated_programming_question.save!(validate: false)
    duplicated_question.save!(validate: false)
    duplicated_programming_question.template_files.each(&:save!)
    duplicated_programming_question.test_cases.each(&:save!)
  end

  def link_to_original_question(duplicated_programming_question)
    @programming_question.question.actable = duplicated_programming_question
    # Update the original programming question's parent_id to link to the new duplicated question
    duplicated_programming_question.update_column(:parent_id, @programming_question.id)
  end

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
