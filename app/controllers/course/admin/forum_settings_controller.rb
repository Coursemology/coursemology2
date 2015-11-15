class Course::Admin::ForumSettingsController < Course::Admin::Controller
  add_breadcrumb :edit, :course_admin_forums_path
  before_action :load_settings

  def edit
  end

  def update
    if @settings.update(forum_settings_params) && current_course.save
      redirect_to course_admin_forums_path(current_course), success: t('.success')
    else
      render 'edit'
    end
  end

  private

  # Load our settings adapter to handle forum settings
  def load_settings
    @settings ||= Course::ForumSettings.new(current_course.settings(:forum))
  end

  def forum_settings_params #:nodoc:
    params.require(:forum_settings).permit(:title, :pagination)
  end
end
