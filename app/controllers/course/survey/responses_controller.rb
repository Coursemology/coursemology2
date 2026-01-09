# frozen_string_literal: true
class Course::Survey::ResponsesController < Course::Survey::Controller
  load_and_authorize_resource :response, through: :survey, class: 'Course::Survey::Response'

  def index
    authorize!(:manage, @survey)
    @course_users = current_course.course_users.order_alphabetically
    @my_students = current_course_user.try(:my_students) || []
  end

  def create
    if current_course_user
      build_response
      @response.save!
      render_response_json
    else
      render json: { error: t('errors.course.survey.responses.no_course_user') }, status: :bad_request
    end
  rescue ActiveRecord::RecordInvalid => e
    handle_create_error(e)
  end

  def show
    authorize!(:read_answers, @response)
    render_response_json
  end

  def edit
    raise CanCan::AccessDenied if cannot?(:submit, @response) && cannot?(:modify, @response)

    @response.build_missing_answers
    if @response.save
      render_response_json
    else
      head :internal_server_error
    end
  end

  def update
    if params[:response][:submit]
      authorize!(:submit, @response)
      survey_bonus_end_time = @response.survey.time_for(current_course_user).bonus_end_at
      @response.submit(survey_bonus_end_time)
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
    @response.answers.includes(:options)
  end

  def render_response_json
    load_sections
    render partial: 'response', locals: {
      response: @response,
      answers: load_answers,
      survey: @survey,
      survey_time: @survey.time_for(current_course_user)
    }
  end

  def response_update_params
    params.
      require(:response).
      permit(answers_attributes: [:id, :text_response, question_option_ids: []])
  end
end
