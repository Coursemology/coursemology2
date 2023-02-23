# frozen_string_literal: true
class Course::Assessment::Question::ProgrammingController < Course::Assessment::Question::Controller
  build_and_authorize_new_question :programming_question,
                                   class: Course::Assessment::Question::Programming, only: [:new, :create]
  load_and_authorize_resource :programming_question,
                              class: Course::Assessment::Question::Programming,
                              through: :assessment, parent: false, except: [:new, :create]
  before_action :load_question_assessment, only: [:edit, :update]
  before_action :set_attributes_for_programming_question

  def new
    @template = 'course/assessment/question/programming/new.json.jbuilder'
  end

  def create
    @template = 'course/assessment/question/programming/new.json.jbuilder'
    @programming_question.package_type =
      programming_question_params.key?(:file) ? :zip_upload : :online_editor
    process_package

    respond_to do |format|
      if @programming_question.save
        load_question_assessment
        format.json { render_success_json t('.success') }
      else
        format.json { render_failure_json t('.failure') }
      end
    end
  end

  def edit
    @programming_question.description = helpers.format_ckeditor_rich_text(@programming_question.description)
    @template = 'course/assessment/question/programming/edit.json.jbuilder'
    @meta = programming_package_service.extract_meta if @programming_question.edit_online?
  end

  def update
    result = @programming_question.class.transaction do
      @question_assessment.skill_ids = programming_question_params[:question_assessment].
                                       try(:[], :skill_ids)
      @programming_question.assign_attributes(programming_question_params.
                                              except(:question_assessment))
      process_package

      raise ActiveRecord::Rollback unless @programming_question.save

      true
    end

    respond_to do |format|
      if result
        format.json { render_success_json t('.success') }
      else
        format.json { render_failure_json t('.failure') }
      end
    end
  end

  def destroy
    if @programming_question.destroy
      head :ok
    else
      error = @programming_question.errors.full_messages.to_sentence
      render json: { errors: error }, status: :bad_request
    end
  end

  private

  def set_attributes_for_programming_question
    @programming_question.max_time_limit = current_course.programming_max_time_limit
  end

  def programming_question_params
    params.require(:question_programming).permit(
      :title, :description, :staff_only_comments, :maximum_grade,
      :language_id, :memory_limit, :time_limit, :attempt_limit,
      :is_codaveri, *attachment_params,
      question_assessment: { skill_ids: [] }
    )
  end

  def render_success_json(message)
    @response = { message: message }

    render 'edit'
  end

  def render_failure_json(message)
    render json: { message: message, errors: @programming_question.errors.full_messages },
           status: :bad_request
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
