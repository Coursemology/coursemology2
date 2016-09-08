# frozen_string_literal: true
class Course::CoursesController < Course::Controller
  include Course::ActivityFeedsConcern

  def index # :nodoc:
    @courses = Course.publicly_accessible.page(page_param)
  end

  def show # :nodoc:
    @registration = Course::Registration.new
    @currently_active_announcements = current_course.announcements.currently_active
    @activity_feeds = recent_activity_feeds.limit(20).includes(activity: [:object, :actor])
    render layout: 'course'
  end

  def new # :nodoc:
  end

  def create # :nodoc:
    if @course.save
      redirect_to course_admin_path(@course), success: t('.success', title: @course.title)
    else
      render 'new'
    end
  end

  def destroy # :nodoc:
  end

  private

  def course_params # :nodoc:
    params.require(:course).
      permit(:title, :description, :status, :start_at, :end_at, :logo)
  end
end
