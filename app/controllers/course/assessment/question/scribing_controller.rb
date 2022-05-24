# frozen_string_literal: true
class Course::Assessment::Question::ScribingController < Course::Assessment::Question::Controller
  build_and_authorize_new_question :scribing_question,
                                   class: Course::Assessment::Question::Scribing, only: [:new, :create]
  load_and_authorize_resource :scribing_question,
                              class: Course::Assessment::Question::Scribing,
                              through: :assessment, parent: false, except: [:new, :create]
  before_action :load_question_assessment, only: [:show, :edit, :update]

  def new
    respond_to do |format|
      format.html { render 'new' }
      format.json { render_scribing_question_json }
    end
  end

  def show
    respond_to do |format|
      format.json { render_scribing_question_json }
    end
  end

  def create # rubocop:disable Metrics/MethodLength
    if file_is_pdf?
      respond_to do |format|
        if pdf_import_service.save
          format.json { render_success_json t('.success') }
        else
          format.json { render_failure_json t('.failure') }
        end
      end
    else
      respond_to do |format|
        if @scribing_question.save
          format.json { render_scribing_question_json }
        else
          format.json { render_failure_json t('.failure') }
        end
      end
    end
  end

  def edit
    respond_to do |format|
      format.html { render 'edit' }
      format.json { render_scribing_question_json }
    end
  end

  # Update does not allow replacement of the attachment/file for the question.
  # TODO: To define and clarify behaviour for this controller action.
  def update
    @question_assessment.skill_ids = scribing_question_params[:question_assessment][:skill_ids]
    respond_to do |format|
      if @scribing_question.update(scribing_question_params.except(:question_assessment))
        format.json { render_scribing_question_json }
      else
        format.json { render_failure_json t('.failure') }
      end
    end
  end

  def destroy
    if @scribing_question.destroy
      redirect_to course_assessment_path(current_course, @assessment), success: t('.success')
    else
      error = @scribing_question.errors.full_messages.to_sentence
      redirect_to course_assessment_path(current_course, @assessment),
                  danger: t('.failure', error: error)
    end
  end

  private

  def scribing_question_params
    permitted_params = [:title, :description, :staff_only_comments, :maximum_grade,
                        question_assessment: { skill_ids: [] }]
    permitted_params << attachment_params if params[:action] == 'create'
    params.require(:question_scribing).permit(*permitted_params)
  end

  def render_scribing_question_json
    @scribing_question.description = helpers.format_html(@scribing_question.description)
    render partial: 'scribing_question'
  end

  def render_success_json(message)
    render json: { message: message }, status: :ok
  end

  def render_failure_json(message)
    render json: { message: message, errors: @scribing_question.errors },
           status: :bad_request
  end

  def file_is_pdf?
    params.dig(:question_scribing, :file)&.content_type&.downcase == 'application/pdf'
  end

  def pdf_import_service
    @service ||= Course::Assessment::Question::ScribingImportService.new(params)
  end

  def load_question_assessment
    @question_assessment = load_question_assessment_for(@scribing_question)
  end
end
