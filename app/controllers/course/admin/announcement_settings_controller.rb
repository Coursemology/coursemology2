class Course::Admin::AnnouncementSettingsController < Course::Admin::Controller
  before_action :load_settings

  def edit #:nodoc:
  end

  def update #:nodoc:
    if @settings.update(announcement_settings_params) && current_course.save
      redirect_to course_admin_announcements_path(current_course), success: t('.success')
    else
      render 'edit'
    end
  end

  private

  # Load our settings adapter to handle announcement settings
  def load_settings
    @settings ||= Course::AnnouncementSettings.new(current_course.settings(:announcement))
  end

  def announcement_settings_params #:nodoc:
    params.require(:announcement_settings).permit(:pagination)
  end
end
