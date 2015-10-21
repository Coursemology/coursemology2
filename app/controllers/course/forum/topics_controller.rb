class Course::Forum::TopicsController < Course::Forum::Controller
  before_action :load_topic, except: [:new, :create]
  load_resource :topic, class: Course::Forum::Topic.name, through: :forum, only: [:new, :create]
  authorize_resource :topic, class: Course::Forum::Topic.name

  def show
    @posts = @topic.posts
    @topic.views.create(user: current_user)
  end

  def new
  end

  def create
    authorize_topic_type!(@topic.topic_type)

    if @topic.save
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

  def authorize_topic_type!(type)
    case type
    when 'sticky'.freeze
      authorize!(:set_sticky, @topic)
    when 'announcement'.freeze
      authorize!(:set_announcement, @topic)
    end
  end

  def update_topic_params
    params.require(:topic).permit(:title, :topic_type)
  end

  def topic_params
    params.require(:topic).permit(:title, :topic_type, posts_attributes: [:text])
  end

  def load_topic
    @topic ||= @forum.topics.friendly.find(params[:id])
  end
end
