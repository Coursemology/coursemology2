# frozen_string_literal: true
class AnnouncementsController < ApplicationController
  load_resource :announcement, class: GenericAnnouncement.name, only: :mark_as_read, id_param: :announcement_id

  def index
    respond_to do |format|
      format.html
      format.json do
        announcements = requesting_unread? ? unread_global_announcements : global_announcements
        @announcements = announcements.includes(:creator)
      end
    end
  end

  # Marks the current GenericAnnouncement as read by the current user and responds without a body.
  # This is meant to be called via javascript.
  def mark_as_read
    @announcement.mark_as_read! for: current_user
    head :ok
  end

  protected

  def publicly_accessible?
    requesting_unread?
  end

  private

  def requesting_unread?
    params[:unread] == 'true'
  end
end
