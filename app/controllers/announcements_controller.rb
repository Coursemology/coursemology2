class AnnouncementsController < ApplicationController
  add_breadcrumb :index, :announcements_path

  def index
    @announcements = GenericAnnouncement.currently_valid
  end
end
