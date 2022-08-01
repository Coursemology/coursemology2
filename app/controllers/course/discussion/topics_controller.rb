# frozen_string_literal: true
class Course::Discussion::TopicsController < Course::ComponentController
  load_and_authorize_resource :discussion_topic, through: :course, instance_name: :topic,
                                                 class: Course::Discussion::Topic.name,
                                                 parent: false
  before_action :add_topics_breadcrumb

  def index
  end

  # Loads topics pending staff reply for course_staff, and unread topics for students.
  def pending
    @topics = if current_course_user&.student?
                unread_topics_for_student
              else
                all_topics.pending_staff_reply
              end
    @topic_count = @topics.count
    @topics = @topics.paginated(filter_page_num)
    render 'topics_list_data'
  end

  def my_students
    @topics = my_students_topics
    @topic_count = @topics.count
    @topics = @topics.paginated(filter_page_num)
    render 'topics_list_data'
  end

  def my_students_pending
    @topics = my_students_topics.pending_staff_reply
    @topic_count = @topics.count
    @topics = @topics.paginated(filter_page_num)
    render 'topics_list_data'
  end

  def all
    @topics = all_topics

    if current_course_user&.student?
      @topics = @topics.merge(Course::Discussion::Topic.from_user(current_course_user.user_id))
    end
    @topic_count = @topics.count
    @topics = @topics.paginated(filter_page_num)
    render 'topics_list_data'
  end

  def toggle_pending
    success = if @topic.pending_staff_reply?
                @topic.unmark_as_pending
              else
                @topic.mark_as_pending
              end

    head :bad_request unless success
  end

  def mark_as_read
    success = @topic.mark_as_read! for: current_user
    head :bad_request unless success
  end

  def filter_page_num
    params.permit(:length)
    params.permit(:page_num).reverse_merge(length: @settings.pagination)
  end

  private

  def all_topics
    @topics.globally_displayed.ordered_by_updated_at.includes(:actable)
  end

  def unread_topics_for_student
    all_topics.from_user(current_user.id).unread_by(current_user)
  end

  def my_students_topics
    my_student_ids = current_course_user ? current_course_user.my_students.pluck(:user_id) : []
    @topics.
      globally_displayed.
      ordered_by_updated_at.
      merge(Course::Discussion::Topic.from_user(my_student_ids)).
      preload(:actable)
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
