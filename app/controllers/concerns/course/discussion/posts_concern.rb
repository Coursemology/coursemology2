# frozen_string_literal: true
module Course::Discussion::PostsConcern
  extend ActiveSupport::Concern

  included do
    before_action :set_topic
    load_and_authorize_resource :post, through: :discussion_topic,
                                       class: Course::Discussion::Post.name, parent: false
  end

  def create
    Course::Discussion::Post.transaction do
      return true if @post.save && create_topic_subscription && update_topic_pending_status
      raise ActiveRecord::Rollback
    end
  end

  def edit
  end

  def update
    @post.update_attributes(post_params)

    respond_to do |format|
      format.js
      format.json { render partial: @post }
    end
  end

  def destroy
    @post.destroy

    respond_to do |format|
      format.js
      format.json { head :ok }
    end
  end

  # Render a new post in a separate page
  def reply
    @reply_post = @post.children.build
  end

  protected

  # Update pending status of the topic:
  # If the student replies to the topic, set to true.
  # If the staff replies the post, set to false.
  def update_topic_pending_status
    return true if !current_course_user || skip_update_topic_status

    if current_course_user.staff?
      @post.topic.unmark_as_pending
    else
      @post.topic.mark_as_pending
    end
  end

  # Option for controller to skip the topic_status.
  def skip_update_topic_status
    false
  end

  # Create topic subscriptions for related users
  #
  # @return [Boolean] True if all subscriptions are created successfully.
  def create_topic_subscription
    raise NotImplementedError, 'To be implemented by the concrete topic posts controller.'
  end

  # The discussion topic record that posts belong to.
  # When your model uses 'acts_as :topic', you can write: 'your_instance.topic' in this method.
  #
  # @return [Course::Discussion::Topic] The discussion topic record.
  def discussion_topic
    raise NotImplementedError, 'To be implemented by the concrete topic posts controller.'
  end

  private

  def post_params
    params.require(:discussion_post).permit(:title, :text, :parent_id)
  end

  def set_topic
    @discussion_topic ||= discussion_topic
  end
end
