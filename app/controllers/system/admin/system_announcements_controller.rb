class System::Admin::SystemAnnouncementsController < System::Admin::Controller
  load_and_authorize_resource :system_announcement, class: System::Announcement.name
  add_breadcrumb :index, :admin_system_announcements_path

  def index
    @system_announcements = @system_announcements.includes(:creator).page(params[:page])
  end

  def new
  end

  def create
    if @system_announcement.save
      redirect_to admin_system_announcements_path,
                  success: t('.success', title: @system_announcement.title)
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @system_announcement.update_attributes(system_announcement_params)
      redirect_to admin_system_announcements_path,
                  success: t('.success', title: @system_announcement.title)
    else
      render 'edit'
    end
  end

  def destroy
    if @system_announcement.destroy
      redirect_to admin_system_announcements_path,
                  success: t('.success',
                             title: @system_announcement.title)
    else
      redirect_to admin_system_announcements_path,
                  danger: t('.failure', @system_announcement.errors.full_messages.to_sentence)
    end
  end

  private

  def system_announcement_params
    params.require(:system_announcement).permit(:title, :content, :valid_from, :valid_to)
  end
end
