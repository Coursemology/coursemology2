# frozen_string_literal: true
class Course::Forum::TopicsController < Course::Forum::ComponentController
  include Course::Forum::TopicControllerHidingConcern
  include Course::Forum::TopicControllerLockingConcern
  include Course::Forum::TopicControllerResolvingConcern
  include Course::Forum::TopicControllerSubscriptionConcern

  before_action :load_topic, except: [:new, :create]
  load_resource :topic, class: Course::Forum::Topic.name, through: :forum, only: [:new, :create]
  authorize_resource :topic, class: Course::Forum::Topic.name, except: [:set_resolved]
  before_action :add_topic_breadcrumb
  after_action :mark_posts_read, only: [:show]

  def show
    @topic.viewed_by(current_user)
    @topic.mark_as_read!(for: current_user)
    @reply_post = @topic.posts.build
  end

  def new
  end

  def create
    authorize_topic_type!(@topic.topic_type)

    if @topic.save
      send_created_notification(@topic)
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  success: t('.success', title: @topic.title)
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    @topic.assign_attributes(update_topic_params)
    authorize_topic_type!(@topic.topic_type)

    if @topic.save
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  success: t('.success', title: @topic.title)
    else
      render 'edit'
    end
  end

  def destroy
    if @topic.destroy
      redirect_to course_forum_path(current_course, @forum),
                  success: t('.success', title: @topic.title)
    else
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  danger: t('.failure', error: @topic.errors.full_messages.to_sentence)
    end
  end

  private

  def update_topic_params
    params.require(:topic).permit(:title, :topic_type)
  end

  def topic_params
    params.require(:topic).permit(:title, :topic_type, posts_attributes: [:text])
  end

  def load_topic
    @topic ||= @forum.topics.friendly.find(params[:id])
  end

  def add_topic_breadcrumb
    add_breadcrumb @topic.title, course_forum_topic_path(current_course, @forum,
                                                         @topic) if @topic&.persisted?
  end

  def mark_posts_read
    @topic.posts.klass.mark_as_read!(@topic.posts.select(&:persisted?), for: current_user)
  end

  def authorize_topic_type!(type)
    case type
    when 'sticky'.freeze
      authorize!(:set_sticky, @topic)
    when 'announcement'.freeze
      authorize!(:set_announcement, @topic)
    end
  end

  def send_created_notification(topic)
    if current_course_user && !current_course_user.phantom?
      Course::Forum::TopicNotifier.topic_created(current_user, topic)
    end
  end
end
