module ApplicationAnnouncementsConcern
  extend ActiveSupport::Concern

  def global_announcements
    SystemAnnouncement.currently_valid + current_tenant.announcements.currently_valid
  end
end
