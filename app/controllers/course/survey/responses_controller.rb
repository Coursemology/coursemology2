# frozen_string_literal: true
class Course::Survey::ResponsesController < Course::Survey::SurveysController
  load_and_authorize_resource :response, through: :survey, class: Course::Survey::Response.name

  def create
    build_response
    @response.save!
  rescue ActiveRecord::RecordInvalid => error
    @response = @survey.responses.accessible_by(current_ability).
                find_by(course_user_id: current_course_user.id)
    if @response
      render json: { responseId: @response.id }, status: :bad_request
    else
      render json: { error: error.message }, status: :bad_request
    end
  end

  def show
    respond_to do |format|
      format.html
      format.json
    end
  end

  def update
    @response.submit if params[:response][:submit]
    render json: { errors: @response.errors }, status: :bad_request \
      unless @response.update_attributes(response_update_params)
  end

  private

  def build_response
    @response.experience_points_record.course_user = current_course_user
    @survey.questions.each do |question|
      @response.answers.build(question: question) do |answer|
        question.options.each do |option|
          answer.options.build(question_option: option)
        end
      end
    end
  end

  def response_update_params
    params.
      require(:response).
      permit(answers_attributes: [:id, :text_response, options_attributes: [:id, :selected]])
  end
end
