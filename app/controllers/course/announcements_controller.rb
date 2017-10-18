# frozen_string_literal: true
class Course::AnnouncementsController < Course::ComponentController
  load_and_authorize_resource :announcement, through: :course, class: Course::Announcement.name
  before_action :add_announcement_breadcrumb
  after_action :mark_announcements_as_read, only: :index

  def index #:nodoc:
    respond_to do |format|
      format.html {}
      format.json do
        @announcements = @announcements.includes(:creator).sorted_by_sticky.sorted_by_date
        @announcements = @announcements.page(page_param).with_read_marks_for(current_user)
      end
    end
  end

  def show #:nodoc:
  end

  def new #:nodoc:
  end

  def create #:nodoc:
    if @announcement.save
      render 'announcement.json.jbuilder'
    else
      render json: { errors: @announcement.errors }, status: :bad_request
    end
  end

  def edit #:nodoc:
  end

  def update #:nodoc:
    if @announcement.update_attributes(announcement_params)
      render 'announcement.json.jbuilder'
    else
      render json: { errors: @announcement.errors }, status: :bad_request
    end
  end

  def destroy #:nodoc:
    if @announcement.destroy
      head :ok
    else
      render json: { errors: @announcement.errors }, status: :bad_request
    end
  end

  private

  def announcement_params #:nodoc:
    params.require(:announcement).permit(:title, :content, :sticky, :start_at, :end_at)
  end

  def add_announcement_breadcrumb
    add_breadcrumb @settings.title || :index, :course_announcements_path
  end

  # @return [Course::AnnouncementsComponent] The announcement component.
  # @return [nil] If announcement component is disabled.
  def component
    current_component_host[:course_announcements_component]
  end

  def mark_announcements_as_read
    unread = Course::Announcement.where(id: @announcements.map(&:id)).unread_by(current_user)
    Course::Announcement.mark_array_as_read(unread, current_user)
  end
end
