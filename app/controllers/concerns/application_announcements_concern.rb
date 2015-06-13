module ApplicationAnnouncementsConcern
  extend ActiveSupport::Concern

  def global_announcements
    GenericAnnouncement.currently_valid
  end
end
