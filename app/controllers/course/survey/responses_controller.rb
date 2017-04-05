# frozen_string_literal: true
class Course::Survey::ResponsesController < Course::Survey::SurveysController
  load_and_authorize_resource :response, through: :survey, class: Course::Survey::Response.name

  def index
    authorize!(:manage, @survey)
    @course_students = current_course.course_users.students.order_alphabetically
    respond_to do |format|
      format.html { render 'course/survey/surveys/index' }
      format.json
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
  rescue ActiveRecord::RecordInvalid => error
    handle_create_error(error)
  end

  def show
    render 'course/survey/surveys/index'
  end

  def edit
    @response.build_missing_answers_and_options
    if @response.save
      render_response_json
    else
      head :internal_server_error
    end
  end

  def update
    if params[:response][:unsubmit]
      handle_unsubmit
    else
      handle_update
    end
  end

  private

  def handle_create_error(error)
    @response = @survey.responses.accessible_by(current_ability).
                find_by(course_user_id: current_course_user.id)
    if @response
      render json: { responseId: @response.id }, status: :bad_request
    else
      render json: { error: error.message }, status: :bad_request
    end
  end

  def handle_unsubmit
    authorize!(:manage, @survey)
    @response.unsubmit
    if @response.save
      render_response_json
    else
      render json: { errors: @response.errors }, status: :bad_request
    end
  end

  def handle_update
    @response.submit if params[:response][:submit]
    if @response.update_attributes(response_update_params)
      render_response_json
    else
      render json: { errors: @response.errors }, status: :bad_request
    end
  end

  def build_response
    @response.experience_points_record.course_user = current_course_user
    @response.build_missing_answers_and_options
  end

  def load_answers
    @answers ||= @response.answers.includes(:options, question: [:section, :options])
  end

  def render_response_json
    load_answers
    render partial: 'response', locals: { response: @response, survey: @survey }
  end

  def response_update_params
    params.
      require(:response).
      permit(answers_attributes: [:id, :text_response, options_attributes: [:id, :selected]])
  end
end
