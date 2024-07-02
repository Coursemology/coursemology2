# frozen_string_literal: true
class Course::Discussion::TopicsController < Course::ComponentController
  include Course::UsersHelper
  include Signals::EmissionConcern

  load_and_authorize_resource :discussion_topic, through: :course, instance_name: :topic,
                                                 class: 'Course::Discussion::Topic',
                                                 parent: false

  signals :comments, after: [:index, :toggle_pending, :mark_as_read]

  def index
  end

  def all
    @topics = all_topics

    if current_course_user&.student?
      @topics = @topics.merge(Course::Discussion::Topic.from_user(current_course_user.user_id))
    end

    render_topics_list_data
  end

  # Loads topics pending staff reply for course_staff, and unread topics for students.
  def pending
    @topics = if current_course_user&.student?
                unread_topics_for_student
              else
                all_topics.pending_staff_reply
              end

    render_topics_list_data
  end

  def my_students
    @topics = my_students_topics
    render_topics_list_data
  end

  def my_students_pending
    @topics = my_students_topics.pending_staff_reply
    render_topics_list_data
  end

  def toggle_pending
    success = if @topic.pending_staff_reply?
                @topic.unmark_as_pending
              else
                @topic.mark_as_pending
              end
    if success
      head :ok
    else
      head :bad_request
    end
  end

  def mark_as_read
    success = @topic.mark_as_read! for: current_user
    if success
      head :ok
    else
      head :bad_request
    end
  end

  private

  def pagination_page_param
    params.permit(:page_num).reverse_merge(length: @settings.pagination)
  end

  def unread_topics_for_student
    all_topics.from_user(current_user.id).unread_by(current_user)
  end

  def all_topics
    @topics.globally_displayed.
      preload([:posts,
               actable: [:question,
                         { submission: [:assessment,
                                        :creator] },
                         file: { answer: [:question,
                                          :submission] }]]).
      order('course_discussion_topics.updated_at DESC')
  end

  def my_students_topics
    my_student_ids = current_course_user ? current_course_user.my_students.pluck(:user_id) : []
    @topics.
      globally_displayed.
      ordered_by_updated_at.
      merge(Course::Discussion::Topic.from_user(my_student_ids)).
      preload(:actable)
  end

  def component
    current_component_host[:course_discussion_topics_component]
  end

  def mark_as_pending?
    params[:pending] == 'true'
  end

  def render_topics_list_data
    @topic_count = @topics.count
    @topics = @topics.paginated(pagination_page_param)

    @course_users_hash = preload_course_users_hash(current_course)

    render 'discussion_topic_list_data'
  end
end
