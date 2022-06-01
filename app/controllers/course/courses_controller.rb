# frozen_string_literal: true
class Course::CoursesController < Course::Controller
  include Course::ActivityFeedsConcern

  skip_authorize_resource :course, only: [:show, :index]
  before_action :load_todos, only: [:show]

  def index # :nodoc:
    @courses = Course.publicly_accessible
    # ordered_by_title.ordered_by_start_at
    # .page(page_param).per(12)
  end

  def show # :nodoc:
    @registration = Course::Registration.new
    @currently_active_announcements = current_course.announcements.currently_active.sorted_by_sticky.sorted_by_date
    @activity_feeds = recent_activity_feeds.limit(20).preload(activity: [{ object: { topic: { actable: :forum } } },
                                                                         :actor])
    load_activity_course_users
    render layout: 'course'
  end

  def new # :nodoc:
  end

  def create # :nodoc:
    if @course.save
      # redirect_to course_admin_path(@course), success: t('.success', title: @course.title)
      render json: { id: @course.id }, status: :ok
    else
      render json: { errors: @course.errors }, status: :bad_request
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

  def load_todos # rubocop:disable Metrics/AbcSize
    return unless current_course_user&.student?

    todos = Course::LessonPlan::Todo.pending_for(current_course_user).
            preload(:user, { item: [:course, actable: :conditions] }).order(updated_at: :desc)
    todos = todos.select(&:can_user_start?)
    @video_todos = todos.select { |td| td.item.actable_type == Course::Video.name }
    @assessment_todos = todos.select { |td| td.item.actable_type == Course::Assessment.name }
    @survey_todos = todos.select { |td| td.item.actable_type == Course::Survey.name }
    load_items_with_timeline
  end

  def load_items_with_timeline # rubocop:disable Metrics/AbcSize
    # preload items with their timeline. Only the first 5 items are preloaded since
    # we are only showing the first 5 items.
    item_ids = [*@video_todos.map { |todo| todo.item.id }.first(5),
                *@assessment_todos.map { |todo| todo.item.id }.first(5),
                *@survey_todos.map { |todo| todo.item.id }.first(5)]
    @todo_items_with_timeline_hash = @course.lesson_plan_items.where(id: item_ids).
                                     with_reference_times_for(current_course_user).
                                     with_personal_times_for(current_course_user).
                                     to_h do |item|
                                       [item.id, item]
                                     end
  end

  def load_activity_course_users
    activity_user_ids = @activity_feeds.map { |x| x.activity.actor_id }.uniq
    @course_users_hash = current_course.course_users.where(user_id: activity_user_ids).to_h do |course_user|
      [course_user.user_id, course_user]
    end
  end
end
