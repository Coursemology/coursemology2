# frozen_string_literal: true
class Course::AnnouncementsController < Course::ComponentController
  include Course::UsersHelper
  include Signals::EmissionConcern

  load_and_authorize_resource :announcement, through: :course, class: 'Course::Announcement'

  after_action :mark_announcements_as_read, only: [:index]

  signals :announcements, after: [:index, :destroy]

  def index
    respond_to do |format|
      format.json do
        @course_users_hash = preload_course_users_hash(current_course)
        @announcements = @announcements.includes(:creator).with_read_marks_for(current_user)
      end
    end
  end

  def create
    if @announcement.save
      render partial: 'announcements/announcement_data',
             locals: { announcement: @announcement }
    else
      render json: { errors: @announcement.errors }, status: :bad_request
    end
  end

  def update
    if @announcement.update(announcement_params)
      render partial: 'announcements/announcement_data',
             locals: { announcement: @announcement },
             status: :ok
    else
      render json: { errors: @announcement.errors }, status: :bad_request
    end
  end

  def destroy
    if @announcement.destroy
      head :ok
    else
      render json: { errors: @announcement.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def announcement_params
    params.require(:announcement).permit(:title, :content, :sticky, :start_at, :end_at)
  end

  # @return [Course::AnnouncementsComponent] The announcement component.
  # @return [nil] If announcement component is disabled.
  def component
    current_component_host[:course_announcements_component]
  end

  def mark_announcements_as_read
    unread = Course::Announcement.where(id: @announcements.map(&:id)).unread_by(current_user)
    Course::Announcement.mark_as_read!(unread, for: current_user)
  end
end
