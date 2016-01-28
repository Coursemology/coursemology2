# frozen_string_literal: true
module ApplicationAnnouncementsHelper
  def global_announcements
    render partial: 'announcements/global_announcements'
  end
end
