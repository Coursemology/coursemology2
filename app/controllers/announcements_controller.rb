# frozen_string_literal: true
class AnnouncementsController < ApplicationController
  load_resource :announcement, class: GenericAnnouncement.name, only: :mark_as_read,
                               id_param: :announcement_id

  add_breadcrumb :index, :announcements_path

  def index
    respond_to do |format|
      format.html
      format.json do
        @announcements = global_announcements.includes(:creator)
      end
    end
  end

  # Marks the current GenericAnnouncement as read by the current user and responds without a body.
  # This is meant to be called via javascript.
  def mark_as_read
    @announcement.mark_as_read! for: current_user
    head :ok
  end

  def unread
    @unread_announcements = unread_global_announcements.sort { |a, b| b.start_at <=> a.start_at }
  end
end
