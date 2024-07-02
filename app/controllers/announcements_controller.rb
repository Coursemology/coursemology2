# frozen_string_literal: true
class AnnouncementsController < ApplicationController
  load_resource :announcement, class: 'GenericAnnouncement', only: :mark_as_read, id_param: :announcement_id

  def index
    respond_to do |format|
      format.json do
        announcements = requesting_unread? ? unread_global_announcements : global_announcements
        @announcements = announcements.includes(:creator)
      end
    end
  end

  def mark_as_read
    if current_user
      @announcement.mark_as_read! for: current_user
      head :ok
    else
      head :no_content
    end
  end

  protected

  def publicly_accessible?
    requesting_unread? || action_name.to_sym == :mark_as_read
  end

  private

  def requesting_unread?
    params[:unread] == 'true'
  end
end
