# frozen_string_literal: true
class Course::AnnouncementsController < Course::ComponentController
  load_and_authorize_resource :announcement, through: :course, class: Course::Announcement.name
  before_action :add_announcement_breadcrumb

  def index
    respond_to do |format|
      format.html
      format.json do
        @announcements = @announcements.includes(:creator).sorted_by_sticky.sorted_by_date
        @announcements = @announcements.with_read_marks_for(current_user)
        mark_announcements_as_read
        render 'index'
      end
    end
  end

  def create
    if @announcement.save
      # Return all announcements for re-rendering ordering purposes
      @announcements = Course::Announcement.where(course_id: current_course.id)
      index
    else
      render json: { errors: @announcement.errors }, status: :bad_request
    end
  end

  def update
    if @announcement.update(announcement_params)
      render partial: 'course/announcements/announcement_list_data',
             locals: { announcement: @announcement },
             status: :ok
    else
      render json: { errors: @announcement.errors }, status: :bad_request
    end
  end

  def destroy
    if @announcement.destroy
      head :ok
    else
      render json: { errors: @announcement.errors }, status: :bad_request
    end
  end

  private

  def announcement_params
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
