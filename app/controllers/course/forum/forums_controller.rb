# frozen_string_literal: true
class Course::Forum::ForumsController < Course::Forum::Controller
  include Course::UsersHelper
  include Signals::EmissionConcern

  load_resource :forum, class: 'Course::Forum', through: :course, only: [:index, :new, :create]

  signals :forums, after: [:mark_all_as_read, :mark_as_read]

  def index
    respond_to do |format|
      format.json do
        @forums = @forums.with_forum_statistics(current_user)
        @unresolved_forums_ids = Course::Forum::Topic.filter_unresolved_forum(@forums.map(&:id))
      end
    end
  end

  def show
    respond_to do |format|
      format.json do
        @topics = @forum.topics.accessible_by(current_ability).order_by_latest_post.with_topic_statistics.
                  with_read_marks_for(current_user).includes(:creator).with_earliest_and_latest_post
        @subscribed_discussion_topic_ids = preload_topic_subscriptons
        @course_users_hash = preload_course_users_hash(current_course)

        render 'show', locals: { forum: forum_with_statistics }
      end
    end
  end

  def create
    if @forum.save
      render partial: 'forum_list_data',
             locals: { forum: forum_with_statistics, isUnresolved: false },
             status: :ok
    else
      render json: { errors: @forum.errors }, status: :bad_request
    end
  end

  def update
    if @forum.update(forum_params)
      render partial: 'forum_list_data',
             locals: { forum: forum_with_statistics,
                       isUnresolved: Course::Forum::Topic.filter_unresolved_forum(@forum.id).present? },
             status: :ok
    else
      render json: { errors: @forum.errors }, status: :bad_request
    end
  end

  def destroy
    if @forum.destroy
      head :ok
    else
      render json: { errors: @forum.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def subscribe
    if @forum.subscriptions.create(user: current_user)
      head :ok
    else
      render json: { errors: @forum.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def unsubscribe
    if @forum.subscriptions.where(user: current_user).delete_all
      head :ok
    else
      render json: { errors: @forum.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def all_posts
    @course_id = current_course.id
    @forum_topic_posts = Course::Discussion::Post.
                         forum_posts.
                         from_course(current_course).
                         posted_by(current_user).
                         with_topic.
                         with_parent.
                         with_creator.
                         group_by { |post| post.topic.specific.forum }.transform_values do |forum|
                           forum.group_by { |post| post.topic.specific }
                         end
  end

  def search
    @search = Course::Forum::Search.new(search_params)
  end

  def mark_all_as_read
    topics = Course::Forum::Topic.from_course(current_course).
             accessible_by(current_ability).unread_by(current_user).to_a
    Course::Forum::Topic.mark_as_read!(topics, for: current_user)

    head :ok
  end

  def mark_as_read
    topics = @forum.topics.accessible_by(current_ability).to_a
    Course::Forum::Topic.mark_as_read!(topics, for: current_user)

    render json: { nextUnreadTopicUrl: helpers.next_unread_topic_link }, status: :ok
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
    params.require(:forum).permit(:name, :description, :forum_topics_auto_subscribe, :course_id)
  end

  def skip_load_forum?
    [:index, :create, :all_posts, :search, :mark_all_as_read].include?(action_name.to_sym)
  end

  def forum_with_statistics
    @forum.calculated(
      :topic_count,
      :topic_view_count,
      :topic_post_count,
      topic_unread_count: current_user
    )
  end

  def preload_topic_subscriptons
    discussion_topic_ids = @topics.map(&:discussion_topic).pluck(:id)
    Course::Discussion::Topic::Subscription.where(topic_id: discussion_topic_ids,
                                                  user_id: current_user.id).pluck(:topic_id).to_set
  end
end
