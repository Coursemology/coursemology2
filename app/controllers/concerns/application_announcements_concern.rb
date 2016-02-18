# frozen_string_literal: true
module ApplicationAnnouncementsConcern
  extend ActiveSupport::Concern

  def global_announcements
    GenericAnnouncement.for_instance(current_tenant).currently_active
  end
end
