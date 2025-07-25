# frozen_string_literal: true
class Course::Admin::ScholaisticSettingsController < Course::Admin::Controller
  def edit
  end

  def update
    update_settings_and_render(scholaistic_settings_params)
  end

  def confirm_link_course
    key = ScholaisticApiService.parse_link_course_callback_request(request, params)
    head :bad_request and return if key.blank?

    update_settings_and_render(integration_key: key)
  end

  def link_course
    head :bad_request and return if @settings.integration_key.present?

    render json: { url: ScholaisticApiService.link_course_url!(current_course) }
  end

  def unlink_course
    head :ok and return if @settings.integration_key.blank?

    ScholaisticApiService.unlink_course!(@settings.integration_key)

    update_settings_and_render(integration_key: nil)
  end

  protected

  def publicly_accessible?
    action_name.to_sym == :confirm_link_scholaistic_course
  end

  private

  def scholaistic_settings_params
    params.require(:settings_scholaistic_component).permit(:assessments_title)
  end

  def component
    current_component_host[:course_scholaistic_component]
  end

  def update_settings_and_render(params)
    if @settings.update(params) && current_course.save
      render 'edit'
    else
      render json: { errors: @settings.errors }, status: :bad_request
    end
  end
end
