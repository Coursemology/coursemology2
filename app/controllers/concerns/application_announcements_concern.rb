module ApplicationAnnouncementsConcern
  extend ActiveSupport::Concern

  def global_announcements
    GenericAnnouncement.for_instance(current_tenant).currently_valid
  end
end
