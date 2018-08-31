# frozen_string_literal: true
class Course::Assessment::Question::ProgrammingController < Course::Assessment::Question::Controller
  build_and_authorize_new_question :programming_question,
                                   class: Course::Assessment::Question::Programming, only: [:new, :create]
  load_and_authorize_resource :programming_question,
                              class: Course::Assessment::Question::Programming,
                              through: :assessment, parent: false, except: [:new, :create]
  before_action :load_question_assessment, only: [:edit, :update]

  def new
    respond_to do |format|
      format.html { render 'new' }
      format.json { render partial: 'programming_question' }
    end
  end

  def create
    @programming_question.package_type =
      programming_question_params.key?(:file) ? :zip_upload : :online_editor
    process_package

    respond_to do |format|
      if @programming_question.save
        load_question_assessment
        format.json { render_success_json t('.success'), true }
      else
        format.json { render_failure_json t('.failure') }
      end
    end
  end

  def edit
    @meta = programming_package_service.extract_meta if @programming_question.edit_online?

    respond_to do |format|
      format.html { render 'edit' }
      format.json { render partial: 'programming_question' }
    end
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
        format.json { render_success_json t('.success'), false }
      else
        format.json { render_failure_json t('.failure') }
      end
    end
  end

  def destroy
    if @programming_question.destroy
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success')
    else
      error = @programming_question.errors.full_messages.to_sentence
      redirect_to course_assessment_path(current_course, @assessment),
                  danger: t('.failure', error: error)
    end
  end

  private

  def programming_question_params
    params.require(:question_programming).permit(
      :title, :description, :staff_only_comments, :maximum_grade,
      :language_id, :memory_limit, :time_limit, :attempt_limit,
      *attachment_params,
      question_assessment: { skill_ids: [] }
    )
  end

  def render_success_json(message, redirect_to_edit)
    @response = { message: message, redirect_to_edit: redirect_to_edit }

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
