class Admin::AnnouncementsController < Admin::Controller
  load_and_authorize_resource :announcement, through: :current_tenant, class:
      Instance::Announcement.name
  add_breadcrumb :index, :admin_announcements_path

  def index
  end
end
