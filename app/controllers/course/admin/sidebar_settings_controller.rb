# frozen_string_literal: true
class Course::Admin::SidebarSettingsController < Course::Admin::Controller
  before_action :load_settings
  add_breadcrumb :index, :course_admin_sidebar_path

  def edit #:nodoc:
  end

  def update #:nodoc:
    if @settings.update(settings_sidebar_params) && current_course.save
      redirect_to course_admin_sidebar_path(current_course), success: t('.success')
    else
      render 'edit'
    end
  end

  private

  def settings_sidebar_params #:nodoc:
    params.require(:settings_sidebar)
  end

  # Load our settings adapter to handle component settings
  def load_settings
    @settings = Course::Settings::Sidebar.new(current_course.settings, sidebar_items(type: :normal))
  end
end
