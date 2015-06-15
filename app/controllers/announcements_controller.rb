class AnnouncementsController < ApplicationController
  add_breadcrumb :index, :announcements_path

  def index
    @announcements = global_announcements.includes(:creator)
  end
end
