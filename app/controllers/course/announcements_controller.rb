# frozen_string_literal: true
class Course::AnnouncementsController < Course::ComponentController
  load_and_authorize_resource :announcement, through: :course, class: Course::Announcement.name
  before_action :add_announcement_breadcrumb
  after_action :mark_announcements_as_read, only: :index

  def index #:nodoc:
    @announcements = @announcements.includes(:creator).sorted_by_sticky.sorted_by_date
    @announcements = @announcements.page(page_param).with_read_marks_for(current_user)
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
    if @announcement.update(announcement_params)
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

  def add_announcement_breadcrumb
    add_breadcrumb @settings.title || :index, :course_announcements_path
  end

  # @return [Course::AnnouncementsComponent] The announcement component.
  # @return [nil] If announcement component is disabled.
  def component
    current_component_host[:course_announcements_component]
  end

  def mark_announcements_as_read
    unread = Course::Announcement.where(id: @announcements.map(&:id)).unread_by(current_user)
    Course::Announcement.mark_as_read!(unread, for: current_user)
  end
end
