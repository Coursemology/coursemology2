# frozen_string_literal: true
class Course::Video::TopicsController < Course::Video::Controller
  load_and_authorize_resource :topic, through: :video, class: Course::Video::Topic.name
  before_action :load_existing_topic, only: :create

  include Course::Discussion::PostsConcern
  skip_load_and_authorize_resource :post, except: :create

  def index
    @topics = @video.topics.includes(posts: :children).order(:timestamp)
    @topics = @topics.reject { |topic| topic.posts.empty? }
    @posts = @topics.map(&:posts).inject(Course::Discussion::Post.none, :+)
  end

  def create
    result = @topic.class.transaction do
      @post.title = @video.title
      @post.parent = last_post_from(@topic)
      raise ActiveRecord::Rollback unless @post.save && create_topic_subscription && update_topic_pending_status
      raise ActiveRecord::Rollback unless @topic.save
      true
    end

    head :bad_request unless result
  end

  def show
  end

  private

  def topic_params
    params.permit(:timestamp, :video_id)
  end

  def reply_topic_id_params
    params.try(:[], :discussion_post).try(:[], :topic_id)
  end

  def discussion_topic
    @topic.try(:discussion_topic)
  end

  def create_topic_subscription
    @topic.ensure_subscribed_by(current_user)
  end

  # TODO: Refactor this properly together with the method
  # in Course::Assessment::SubmissionQuestion::CommentsController
  def last_post_from(topic)
    # @post is in topic.posts, so we filter out @post, which has no id yet.
    topic.posts.ordered_topologically.flatten.select(&:id).last
  end

  def load_existing_topic
    return if reply_topic_id_params.blank?
    @topic = Course::Video::Topic.find(reply_topic_id_params)
  end
end
