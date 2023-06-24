# frozen_string_literal: true
class Course::Admin::SidebarSettingsController < Course::Admin::Controller
  before_action :load_settings

  def edit
    respond_to do |format|
      format.html { render 'course/admin/index' }
      format.json
    end
  end

  def update
    if @settings.update(settings_sidebar_params) && current_course.save
      render 'edit'
    else
      render json: { errors: @settings.errors }, status: :bad_request
    end
  end

  private

  def settings_sidebar_params
    params.require(:settings_sidebar)
  end

  # Load our settings adapter to handle component settings
  def load_settings
    @settings = Course::Settings::Sidebar.new(current_course.settings, sidebar_items(type: :normal))
  end
end
