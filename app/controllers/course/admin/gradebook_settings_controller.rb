# frozen_string_literal: true
class Course::Admin::GradebookSettingsController < Course::Admin::Controller
  def edit
    respond_to(&:json)
  end

  def update
    if @settings.update(gradebook_settings_params) && current_course.save
      render 'edit'
    else
      render json: { errors: @settings.errors }, status: :bad_request
    end
  end

  private

  def gradebook_settings_params
    params.require(:settings_gradebook_component).permit(:weighted_view_enabled)
  end

  def component
    current_component_host[:course_gradebook_component]
  end

  def authorize_admin
    authorize! :manage_gradebook_settings, current_course
  end
end
