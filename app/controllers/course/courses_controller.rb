# frozen_string_literal: true
class Course::CoursesController < Course::Controller
  include Course::ActivityFeedsConcern

  skip_authorize_resource :course, only: [:show, :index]
  before_action :load_todos, only: [:show]

  def index # :nodoc:
    @courses = Course.publicly_accessible.ordered_by_start_at.page(page_param).per(24)
  end

  def show # :nodoc:
    @registration = Course::Registration.new
    @currently_active_announcements = current_course.announcements.currently_active.sorted_by_sticky.sorted_by_date
    @activity_feeds = recent_activity_feeds.limit(20).preload(activity: [:object, :actor])
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

  protected

  def publicly_accessible?
    params[:action] == 'index'
  end

  private

  def course_params # :nodoc:
    params.require(:course).
      permit(:title, :description, :status, :start_at, :end_at, :logo)
  end

  def load_todos
    return unless current_course_user&.student?

    todos = Course::LessonPlan::Todo.pending_for(current_course_user).
            includes(:user, item: :course).order(updated_at: :desc)
    # TODO: Fix n+1 query for #can_user_start?
    todos = todos.select(&:can_user_start?)
    @video_todos = todos.select { |td| td.item.actable_type == Course::Video.name }
    @assessment_todos = todos.select { |td| td.item.actable_type == Course::Assessment.name }
    @survey_todos = todos.select { |td| td.item.actable_type == Course::Survey.name }
  end
end
