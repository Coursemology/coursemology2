# frozen_string_literal: true
class Course::Forum::ForumsController < Course::Forum::Controller
  before_action :load_forum, except: [:index, :new, :create]
  load_resource :forum, class: Course::Forum.name, through: :course, only: [:index, :new, :create]
  before_action :add_forum_item_breadcrumb

  def index
    @forums = @forums.order(:created_at).with_forum_statistics
  end

  def show
    @topics = @forum.topics.accessible_by(current_ability).order_by_date.
              with_topic_statistics.includes(:creator).page(page_param).with_latest_post
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
    redirect_path = course_forum_path(current_course, @forum)
    if @forum.subscriptions.create(user: current_user)
      redirect_to redirect_path, success: t('.success', name: @forum.name)
    else
      redirect_to redirect_path,
                  danger: t('.failure', error: @forum.errors.full_messages.to_sentence)
    end
  end

  def unsubscribe
    redirect_path = course_forum_path(current_course, @forum)
    if @forum.subscriptions.where(user: current_user).delete_all
      redirect_to redirect_path, success: t('.success', name: @forum.name)
    else
      redirect_to redirect_path,
                  danger: t('.failure', error: @forum.errors.full_messages.to_sentence)
    end
  end

  private

  def forum_params
    params.require(:forum).permit(:name, :description, :course_id)
  end

  def load_forum
    @forum ||= current_course.forums.friendly.find(params[:id])
  end

  def add_forum_item_breadcrumb
    add_breadcrumb @forum.name, course_forum_path(current_course, @forum) if @forum.try(:persisted?)
  end
end
