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

  def timestamp_param
    topic_params[:timestamp]
  end

  def parent_id_param
    params.try(:[], :discussion_post).try(:[], :parent_id)
  end

  def discussion_topic
    @topic.try(:discussion_topic)
  end

  def create_topic_subscription
    @topic.ensure_subscribed_by(current_user)
  end

  def load_existing_topic
    return unless timestamp_param || parent_id_param

    topic = if timestamp_param
              @video.topics.find_by(timestamp: timestamp_param.to_i)
            elsif parent_id_param
              Course::Discussion::Post.find(parent_id_param).topic.specific
            end
    @topic = topic unless topic.nil?
  end
end
