# frozen_string_literal: true
class Course::Survey::ResponsesController < Course::Survey::Controller
  load_and_authorize_resource :response, through: :survey, class: Course::Survey::Response.name

  def index
    authorize!(:manage, @survey)
    respond_to do |format|
      format.html { render 'course/survey/surveys/index' }
      format.json do
        @course_students = current_course.course_users.students.order_alphabetically
      end
    end
  end

  def create
    if current_course_user
      build_response
      @response.save!
      render_response_json
    else
      render json: { error: t('course.survey.responses.no_course_user') }, status: :bad_request
    end
  rescue ActiveRecord::RecordInvalid => e
    handle_create_error(e)
  end

  def show
    authorize!(:read_answers, @response)
    respond_to do |format|
      format.html { render 'course/survey/surveys/index' }
      format.json { render_response_json }
    end
  end

  def edit
    raise CanCan::AccessDenied if cannot?(:submit, @response) && cannot?(:modify, @response)

    respond_to do |format|
      format.html { render 'course/survey/surveys/index' }
      format.json do
        @response.build_missing_answers
        if @response.save
          render_response_json
        else
          head :internal_server_error
        end
      end
    end
  end

  def update
    if params[:response][:submit]
      authorize!(:submit, @response)
      @response.submit
    else
      authorize!(:modify, @response)
      @response.update_updated_at
    end

    if @response.update(response_update_params)
      render_response_json
    else
      render json: { errors: @response.errors }, status: :bad_request
    end
  end

  def unsubmit
    @response.unsubmit
    if @response.save
      render_response_json
    else
      head :bad_request
    end
  end

  private

  def handle_create_error(error)
    @response = @survey.responses.accessible_by(current_ability).
                find_by(course_user_id: current_course_user.id)
    if @response
      render partial: 'see_other', status: :see_other
    else
      render json: { error: error.message }, status: :bad_request
    end
  end

  def build_response
    @response.experience_points_record.course_user = current_course_user
    @response.build_missing_answers
  end

  def load_answers
    @answers ||= @response.answers.includes(:options)
  end

  def render_response_json
    load_sections
    load_answers
    render partial: 'response',
           locals: { response: @response, answers: @answers, survey: @survey }
  end

  def response_update_params
    params.
      require(:response).
      permit(answers_attributes: [:id, :text_response, question_option_ids: []])
  end
end
