# frozen_string_literal: true
class Course::Admin::ScholaisticSettingsController < Course::Admin::Controller
  skip_forgery_protection only: :confirm_link_course
  skip_authorize_resource :course, only: :confirm_link_course

  def edit
    render_settings
  end

  def update
    update_settings_and_render(scholaistic_settings_params)
  end

  def confirm_link_course
    key = ScholaisticApiService.parse_link_course_callback_request(request, params)
    head :bad_request and return if key.blank?

    @settings.update(integration_key: key) && current_course.save
  end

  def link_course
    head :bad_request and return if @settings.integration_key.present?

    render json: {
      redirectUrl: ScholaisticApiService.link_course_url!(
        course_title: current_course.title,
        course_url: course_url(current_course),
        callback_url: course_admin_scholaistic_confirm_link_course_url(current_course)
      )
    }
  end

  def unlink_course
    head :ok and return if @settings.integration_key.blank?

    ScholaisticApiService.unlink_course!(@settings.integration_key)

    update_settings_and_render(integration_key: nil)
  end

  protected

  def publicly_accessible?
    action_name.to_sym == :confirm_link_course
  end

  private

  def scholaistic_settings_params
    params.require(:settings_scholaistic_component).permit(:assessments_title)
  end

  def component
    current_component_host[:course_scholaistic_component]
  end

  def render_settings
    @ping_result = ScholaisticApiService.ping_course(@settings.integration_key) if @settings.integration_key.present?
    render 'edit'
  end

  def update_settings_and_render(params)
    if @settings.update(params) && current_course.save
      render_settings
    else
      render json: { errors: @settings.errors }, status: :bad_request
    end
  end
end
