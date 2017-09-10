# frozen_string_literal: true
class Course::Forum::ForumsController < Course::Forum::Controller
  load_resource :forum, class: Course::Forum.name, through: :course, only: [:index, :new, :create]
  before_action :add_forum_item_breadcrumb

  def index
    @forums = @forums.order(:created_at).with_forum_statistics(current_user)
  end

  def show
    @topics = @forum.topics.accessible_by(current_ability).order_by_latest_post.with_topic_statistics.
              page(page_param).with_read_marks_for(current_user).includes(:creator).with_latest_post
  end

  def new
  end

  def create
    if @forum.save
      redirect_to course_forums_path(current_course), success: t('.success', name: @forum.name)
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @forum.update_attributes(forum_params)
      redirect_to course_forum_path(current_course, @forum),
                  success: t('.success', name: @forum.name)
    else
      render 'edit'
    end
  end

  def destroy
    if @forum.destroy
      redirect_to course_forums_path(current_course), success: t('.success', name: @forum.name)
    else
      redirect_to course_forum_path(current_course, @forum),
                  danger: t('.failure', error: @forum.errors.full_messages.to_sentence)
    end
  end

  def subscribe
    if @forum.subscriptions.create(user: current_user)
      flash.now[:success] = t('.success', name: @forum.name)
    else
      flash.now[:danger] = t('.failure', error: @forum.errors.full_messages.to_sentence)
    end
    render 'update_subscribe_button'
  end

  def unsubscribe
    if @forum.subscriptions.where(user: current_user).delete_all > 0
      flash.now[:success] = t('.success', name: @forum.name)
    else
      flash.now[:danger] = t('.failure')
    end
    render 'update_subscribe_button'
  end

  def search
    @search = Course::Forum::Search.new(search_params)
  end

  def next_unread # rubocop:disable Metrics/AbcSize
    topic = Course::Forum::Topic.from_course(current_course).
            accessible_by(current_ability).unread_by(current_user).first

    if topic
      redirect_to course_forum_topic_path(current_course, topic.forum, topic)
    else
      redirect_to course_forums_path(current_course), notice: t('.notice')
    end
  end

  def mark_all_as_read
    topics = Course::Forum::Topic.from_course(current_course).
             accessible_by(current_ability).unread_by(current_user).to_a
    Course::Forum::Topic.mark_as_read!(topics, for: current_user)
    redirect_to course_forums_path(current_course), success: t('.success')
  end

  def mark_as_read
    topics = @forum.topics.accessible_by(current_ability).to_a
    Course::Forum::Topic.mark_as_read!(topics, for: current_user)

    redirect_to course_forum_path(current_course, @forum), success: t('.success')
  end

  private

  def search_params
    if params[:search]
      params.require(:search).permit(:course_user_id, :start_time, :end_time)
    else
      {}
    end.reverse_merge(course: current_course)
  end

  def forum_params
    params.require(:forum).permit(:name, :description, :course_id)
  end

  def add_forum_item_breadcrumb
    add_breadcrumb @forum.name, course_forum_path(current_course, @forum) if @forum&.persisted?
  end

  def skip_load_forum?
    [:index, :new, :create, :search, :next_unread, :mark_all_as_read].include?(action_name.to_sym)
  end
end
