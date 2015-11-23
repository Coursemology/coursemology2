class Course::Discussion::PostsController < Course::ComponentController
  before_action :set_topic
  authorize_resource :topic
  load_and_authorize_resource :post, through: :topic, class: Course::Discussion::Post.name

  def create
    if create_post
      redirect_to create_success_path
    else
      redirect_to create_fail_path
    end
  end

  def update
    if @post.update_attributes(post_params)
      redirect_to update_success_path
    else
      redirect_to update_fail_path
    end
  end

  def destroy
    if @post.destroy
      redirect_to destroy_success_path
    else
      redirect_to destroy_fail_path
    end
  end

  # Render a new post in a separate page
  # This can be used when you do not want to introduce javascript to your implementation
  def reply
  end

  protected

  # The default redirecting path of all the actions.
  # You can rewrite these functions to change specific return paths:
  #   create_success_path, create_fail_path
  #   update_success_path, update_fail_path
  #   destroy_success_path, destroy_fail_path
  #
  # @return [String] The return path
  def default_return_path
    fail NotImplementedError, 'To be implemented by the concrete topic posts controller.'
  end

  # Create topic subscriptions for related users
  #
  # @return [Bool] True if all subscriptions are created successfully.
  def auto_subscribe_topic
    fail NotImplementedError, 'To be implemented by the concrete topic posts controller.'
  end

  # The discussion topic record that posts belong to.
  # When your model uses 'acts_as :topic', you can write: 'your_instance.topic' in this method.
  #
  # @return [Course::Discussion::Topic] The discussion topic record.
  def topic
    fail NotImplementedError, 'To be implemented by the concrete topic posts controller.'
  end

  def create_success_path
    default_return_path
  end

  alias_method :create_fail_path, :create_success_path
  alias_method :update_success_path, :create_success_path
  alias_method :update_fail_path, :create_success_path
  alias_method :destroy_success_path, :create_success_path
  alias_method :destroy_fail_path, :create_success_path

  private

  def set_topic
    @topic ||= topic
  end

  def create_post
    Course::Discussion::Post.transaction do
      fail ActiveRecord::Rollback unless @post.save
      fail ActiveRecord::Rollback unless auto_subscribe_topic
      true
    end
  end

  def post_params
    params.require(:discussion_post).permit(:title, :text, :parent_id)
  end
end
