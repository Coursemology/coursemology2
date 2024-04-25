# frozen_string_literal: true
class Course::CoursesController < Course::Controller
  include Course::ActivityFeedsConcern
  skip_authorize_resource :course, only: [:show, :index, :sidebar]

  def index
    @courses = Course.publicly_accessible
  end

  def show
    @currently_active_announcements = current_course.announcements.
                                          currently_active.includes(:creator)
    @activity_feeds = recent_activity_feeds.limit(20).preload(activity: [{ object: { topic: { actable: :forum } } },
                                                                          :actor])
    load_activity_course_users
    load_todos
    load_items_with_timeline
  end

  def create
    if @course.save
      render json: { id: @course.id, title: @course.title }, status: :ok
    else
      render json: { errors: @course.errors }, status: :bad_request
    end
  end

  def destroy
  end

  def sidebar
    @home_redirects_to_learn =
      current_course_user&.student? &&
      current_component_host[:course_stories_component] &&
      current_course.settings(:course_stories_component).push_key.present?
  end

  protected

  def publicly_accessible?
    Set[:index].include?(action_name.to_sym)
  end

  private

  def course_params
    params.require(:course).
      permit(:title, :description, :status, :start_at, :end_at, :logo)
  end

  def load_todos # rubocop:disable Metrics/AbcSize
    return unless current_course_user&.student?

    todos = Course::LessonPlan::Todo.pending_for(current_course_user).
            preload(:user, { item: [:default_reference_time, :course, actable: :conditions] }).
            order(end_at: :asc, start_at: :asc)
    todos = todos.select(&:can_user_start?)
    @video_todos = todos.select { |td| td.item.actable_type == Course::Video.name }
    @assessment_todos = todos.select { |td| td.item.actable_type == Course::Assessment.name }
    @survey_todos = todos.select { |td| td.item.actable_type == Course::Survey.name }

    @assessment_todos_hash = Course::Assessment::Submission.
                             where(
                               'creator_id in (?) and assessment_id in (?)',
                               current_user.id,
                               @assessment_todos.map(&:item).pluck(:actable_id)
                             ).
                             to_h { |submission| [submission.assessment_id, submission] }

    @survey_todos_hash = Course::Survey::Response.
                         where(
                           'creator_id in (?) and survey_id in (?)',
                           current_user.id,
                           @survey_todos.map(&:item).pluck(:actable_id)
                         ).
                         to_h { |survey| [survey.survey_id, survey] }
  end

  def load_items_with_timeline # rubocop:disable Metrics/CyclomaticComplexity
    item_ids = [*@video_todos&.map { |todo| todo.item.id },
                *@assessment_todos&.map { |todo| todo.item.id },
                *@survey_todos&.map { |todo| todo.item.id }]
    @todo_items_with_timeline_hash = @course.lesson_plan_items.where(id: item_ids).
                                     with_reference_times_for(current_course_user, current_course).
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
