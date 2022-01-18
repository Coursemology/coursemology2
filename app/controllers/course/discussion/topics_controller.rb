# frozen_string_literal: true
class Course::Discussion::TopicsController < Course::ComponentController
  skip_authorize_resource :course, only: [:unmark_as_pending]
  load_and_authorize_resource :discussion_topic, through: :course, instance_name: :topic,
                                                 class: Course::Discussion::Topic.name,
                                                 parent: false, except: [:unmark_as_pending]
  before_action :add_topics_breadcrumb, except: [:unmark_as_pending]

  def index
    @topics = all_topics

    return unless current_course_user&.student?

    @topics = @topics.merge(Course::Discussion::Topic.from_user(current_course_user.user_id))
  end

  # Loads topics pending staff reply for course_staff, and unread topics for students.
  def pending
    @topics = if current_course_user&.student?
                unread_topics_for_student
              else
                all_topics.pending_staff_reply
              end
  end

  def my_students
    @topics = my_students_topics
  end

  def my_students_pending
    @topics = my_students_topics.pending_staff_reply
  end

  def unmark_as_pending
    @topic = Course::Discussion::Topic.find_by(id: params[:id], course_id: params[:course_id])
    authentication_success = params[:token] && @topic&.create_token_from_record == params[:token]
    if authentication_success && @topic&.unmark_as_pending
      redirect_to root_path, success: t('course.discussion.topics.unmark_as_pending_success')
    else
      redirect_to root_path, danger: t('course.discussion.topics.unmark_as_pending_failed')
    end
  end

  def toggle_pending
    success = if mark_as_pending?
                @topic.mark_as_pending
              else
                @topic.unmark_as_pending
              end

    head :bad_request unless success
  end

  def mark_as_read
    @topic.mark_as_read! for: current_user
    redirect_back fallback_location: course_topics_path(current_course)
  end

  protected

  def publicly_accessible?
    params[:action] == 'unmark_as_pending'
  end

  private

  def all_topics
    @topics.globally_displayed.ordered_by_updated_at.includes(:actable).page(page_param).
      per(@settings.pagination)
  end

  def unread_topics_for_student
    all_topics.from_user(current_user.id).unread_by(current_user)
  end

  def my_students_topics
    my_student_ids = current_course_user ? current_course_user.my_students.pluck(:user_id) : []
    @topics = @topics.
              globally_displayed.
              ordered_by_updated_at.
              merge(Course::Discussion::Topic.from_user(my_student_ids)).
              preload(:actable).
              page(page_param)
  end

  def add_topics_breadcrumb
    add_breadcrumb @settings.title || :index, :course_topics_path
  end

  def component
    current_component_host[:course_discussion_topics_component]
  end

  def mark_as_pending?
    params[:pending] == 'true'
  end
end
