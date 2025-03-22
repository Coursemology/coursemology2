# frozen_string_literal: true
class Course::Forum::TopicsController < Course::Forum::ComponentController
  include Course::UsersHelper
  include Course::Forum::TopicControllerHidingConcern
  include Course::Forum::TopicControllerLockingConcern
  include Course::Forum::TopicControllerSubscriptionConcern
  include Signals::EmissionConcern
  include Course::Forum::AutoAnsweringConcern

  before_action :load_topic, except: [:create]
  load_resource :topic, class: 'Course::Forum::Topic', through: :forum, only: [:create]
  authorize_resource :topic, class: 'Course::Forum::Topic', except: [:set_resolved]
  after_action :mark_posts_read, only: [:show]

  signals :forums, after: [:show]

  def show
    @topic.viewed_by(current_user)
    @topic.safely_mark_as_read!(for: current_user)
    @posts = @topic.posts.with_read_marks_for(current_user).
             calculated(:upvotes, :downvotes).
             with_user_votes(current_user).
             include_drafts_for_teaching_staff(current_course_user, current_course).
             ordered_topologically
    @course_users_hash = preload_course_users_hash(current_course)
  end

  def create
    authorize_topic_type!(@topic.topic_type)
    if @topic.save
      send_created_notification(@topic)
      @topic.ensure_subscribed_by(current_user) if @forum.forum_topics_auto_subscribe
      mark_posts_read
      auto_answer_action(@topic.posts.first, @topic)
      render json: { redirectUrl: course_forum_topic_path(current_course, @forum, @topic) }, status: :ok
    else
      render json: { errors: @topic.errors }, status: :bad_request
    end
  end

  def update
    @topic.assign_attributes(update_topic_params)
    authorize_topic_type!(@topic.topic_type)

    if @topic.save
      render partial: 'topic_list_data', locals: { forum: @topic.forum, topic: @topic }, status: :ok
    else
      render json: { errors: @topic.errors }, status: :bad_request
    end
  end

  def destroy
    if @topic.destroy
      head :ok
    else
      render json: { errors: @topic.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def update_topic_params
    params.require(:topic).permit(:title, :topic_type)
  end

  def topic_params
    params.require(:topic).permit(:title, :topic_type, posts_attributes: [:text, :is_anonymous])
  end

  def load_topic
    @topic ||= @forum.topics.friendly.find(params[:id])
  end

  def mark_posts_read
    @topic.posts.klass.mark_as_read!(@topic.posts.select(&:persisted?), for: current_user)
  end

  def authorize_topic_type!(type)
    case type
    when 'sticky'
      authorize!(:set_sticky, @topic)
    when 'announcement'
      authorize!(:set_announcement, @topic)
    end
  end

  def send_created_notification(topic)
    return unless current_course_user

    Course::Forum::TopicNotifier.topic_created(current_user, current_course_user, topic)
  end
end
