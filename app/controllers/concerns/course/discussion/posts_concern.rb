module Course::Discussion::PostsConcern
  extend ActiveSupport::Concern

  included do
    before_action :set_topic
    authorize_resource :discussion_topic
    load_and_authorize_resource :post, through: :discussion_topic,
                                       class: Course::Discussion::Post.name
  end

  def create
    Course::Discussion::Post.transaction do
      if @post.save && create_topic_subscription
        true
      else
        fail ActiveRecord::Rollback
      end
    end
  end

  def edit
  end

  def update
    @post.update_attributes(post_params)
  end

  def destroy
    @post.destroy
  end

  # Render a new post in a separate page
  def reply
    @reply_post = @discussion_topic.posts.build(title: t('course.discussion.posts.reply_title',
                                                         title: @post.title))
  end

  protected

  # Create topic subscriptions for related users
  #
  # @return [Bool] True if all subscriptions are created successfully.
  def create_topic_subscription
    fail NotImplementedError, 'To be implemented by the concrete topic posts controller.'
  end

  # The discussion topic record that posts belong to.
  # When your model uses 'acts_as :topic', you can write: 'your_instance.topic' in this method.
  #
  # @return [Course::Discussion::Topic] The discussion topic record.
  def discussion_topic
    fail NotImplementedError, 'To be implemented by the concrete topic posts controller.'
  end

  private

  def set_topic
    @discussion_topic ||= discussion_topic
  end

  def post_params
    params.require(:discussion_post).permit(:title, :text, :parent_id)
  end
end
