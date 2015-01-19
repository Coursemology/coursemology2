class Admin::AnnouncementsController < Admin::Controller
  load_and_authorize_resource :announcement, through: :current_tenant, class:
      Instance::Announcement.name
  add_breadcrumb :index, :admin_announcements_path

  def index
  end

  def new
  end

  def create
    if @announcement.save
      redirect_to admin_announcements_path,
                  notice: t('.notice', title: @announcement.title)
    else
      render 'new'
    end
  end

  private

  def announcement_params
    params.require(:instance_announcement).permit(:title, :content, :valid_from, :valid_to)
  end
end
