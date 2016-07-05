# frozen_string_literal: true
module ApplicationAnnouncementsConcern
  extend ActiveSupport::Concern

  # Returns active global announcements unread by the current user, if one is signed in.
  #
  # @return [Array<GenericAnnouncement>] Unread announcements
  def unread_global_announcements
    user_signed_in? ? global_announcements.unread_by(current_user) : global_announcements
  end

  # Returns all active global announcements.
  #
  # @return [Array<GenericAnnouncement>] Active announcements
  def global_announcements
    GenericAnnouncement.for_instance(current_tenant).currently_active
  end
end
