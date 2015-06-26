class Course::Admin::ComponentSettingsController < Course::Admin::Controller
  before_action :load_settings
  add_breadcrumb :index, :course_admin_components_path

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

  # Load our settings adapter to handle component settings
  def load_settings
    @settings = Course::Settings::Effective.new(current_course, current_component_host)
  end

  def settings_effective_params #:nodoc:
    params.require(:settings_effective)
  end
end
