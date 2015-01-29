class Admin::SystemAnnouncementsController < Admin::Controller
  load_and_authorize_resource :system_announcement, class: SystemAnnouncement.name

  def index
    @system_announcements = @system_announcements.includes(:creator)
  end
end
