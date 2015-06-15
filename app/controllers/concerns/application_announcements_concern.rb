module ApplicationAnnouncementsConcern
  extend ActiveSupport::Concern

  def global_announcements
    GenericAnnouncement.for_instance(ActsAsTenant.current_tenant).currently_valid
  end
end
