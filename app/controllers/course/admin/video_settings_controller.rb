# frozen_string_literal: true
class Course::Admin::VideoSettingsController < Course::Admin::Controller
  def edit
    respond_to do |format|
      format.html { render 'course/admin/index' }
      format.json
    end
  end

  def update
    if @settings.update(video_settings_params) &&
       current_course.update(video_tabs_params) &&
       current_course.save
      render 'edit'
    else
      render json: { errors: @settings.errors }, status: :bad_request
    end
  end

  private

  def video_settings_params
    params.require(:settings_videos_component).permit(:title)
  end

  def video_tabs_params
    params.
      require(:settings_videos_component).
      require(:course).
      permit(video_tabs_attributes: [:id, :title, :weight])
  end

  def component
    current_component_host[:course_videos_component]
  end
end
