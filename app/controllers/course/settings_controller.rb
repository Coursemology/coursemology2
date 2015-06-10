class Course::SettingsController < Course::ComponentController
  layout 'course_settings'
  before_action :load_settings, only: [:components, :update_components]

  def index
  end

  def update #:nodoc:
    if @course.update_attributes(course_setting_params)
      redirect_to course_settings_path(current_course),
                  success: t('.success', title: current_course.title)
    else
      render 'index'
    end
  end

  def components #:nodoc:
  end

  def update_components #:nodoc:
    @settings.update(settings_effective_params)
    if current_course.save
      redirect_to course_components_path(current_course), success: t('.success')
    else
      @settings.errors = current_course.errors
      render 'components'
    end
  end

  private

  # Load our settings adapter to handle component settings
  def load_settings
    @settings = Course::Settings::Effective.new(current_course, current_component_host)
  end

  def course_setting_params #:nodoc:
    params.require(:course).
      permit(:title, :description, :status, :start_at, :end_at)
  end

  def settings_effective_params #:nodoc:
    params.require(:settings_effective)
  end
end
