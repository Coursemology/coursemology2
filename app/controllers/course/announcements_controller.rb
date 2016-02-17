class Course::AnnouncementsController < Course::ComponentController
  load_and_authorize_resource :announcement, through: :course, class: Course::Announcement.name
  before_action :check_component
  before_action :load_settings
  before_action :add_announcement_breadcrumb

  def index #:nodoc:
    @announcements = @announcements.includes(:creator).sorted_by_sticky.sorted_by_date
    @announcements = @announcements.page(page_param)
    unread = @announcements.unread_by(current_user)
    Course::Announcement.mark_array_as_read(unread, current_user)
  end

  def show #:nodoc:
  end

  def new #:nodoc:
  end

  def create #:nodoc:
    if @announcement.save
      redirect_to course_announcements_path(current_course),
                  success: t('.success', title: @announcement.title)
    else
      render 'new'
    end
  end

  def edit #:nodoc:
  end

  def update #:nodoc:
    if @announcement.update_attributes(announcement_params)
      redirect_to course_announcements_path(current_course),
                  success: t('.success', title: @announcement.title)
    else
      render 'edit'
    end
  end

  def destroy #:nodoc:
    if @announcement.destroy
      redirect_to course_announcements_path(current_course),
                  success: t('.success', title: @announcement.title)
    else
      redirect_to course_announcements_path(current_course),
                  danger: t('.failure', error: @announcement.errors.full_messages.to_sentence)
    end
  end

  private

  def announcement_params #:nodoc:
    params.require(:announcement).permit(:title, :content, :sticky, :start_at, :end_at)
  end

  # Ensure that the component is enabled.
  #
  # @raise [Coursemology::ComponentNotFoundError] When the component is disabled.
  def check_component
    raise ComponentNotFoundError unless component
  end

  # Load current component's settings
  def load_settings
    @announcement_settings = component.settings
  end

  def add_announcement_breadcrumb
    add_breadcrumb @announcement_settings.title || :index, :course_announcements_path
  end

  # @return [Course::AnnouncementsComponent] The announcement component.
  # @return [nil] If announcement component is disabled.
  def component
    current_component_host[:course_announcements_component]
  end
end
