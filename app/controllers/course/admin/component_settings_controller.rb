class Course::Admin::ComponentSettingsController < Course::Admin::Controller
  before_action :load_settings
  add_breadcrumb :edit, :course_admin_components_path

  def edit #:nodoc:
  end

  def update #:nodoc:
    @settings.update(settings_effective_params)
    if current_course.save
      redirect_to course_admin_components_path(current_course), success: t('.success')
    else
      @settings.errors = current_course.errors
      render 'edit'
    end
  end

  private

  def settings_effective_params #:nodoc:
    params.require(:settings_effective)
  end

  # Load our settings adapter to handle component settings
  def load_settings
    @settings = Course::Settings::Effective.new(current_course, current_component_host)
  end
end
