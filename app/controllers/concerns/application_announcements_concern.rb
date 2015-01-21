module ApplicationAnnouncementsConcern
  extend ActiveSupport::Concern

  def global_announcements
    current_tenant.announcements.currently_valid
  end
end
