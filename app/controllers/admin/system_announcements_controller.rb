class Admin::SystemAnnouncementsController < Admin::Controller
  load_and_authorize_resource :system_announcement, class: SystemAnnouncement.name

  def index
    @system_announcements = @system_announcements.includes(:creator)
  end

  def new
  end

  def create
    if @system_announcement.save
      redirect_to admin_system_announcements_path,
                  notice: t('.notice', title: @system_announcement.title)
    else
      render 'new'
    end
  end

  private

  def system_announcement_params
    params.require(:system_announcement).permit(:title, :content, :valid_from, :valid_to)
  end
end
