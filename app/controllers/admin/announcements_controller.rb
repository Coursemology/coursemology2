class Admin::AnnouncementsController < Admin::Controller
  load_and_authorize_resource :announcement, through: :current_tenant, class:
      Instance::Announcement.name
  add_breadcrumb :index, :admin_announcements_path

  def index
    @announcements = @announcements.includes(:creator).page(params[:page])
  end

  def new
  end

  def create
    if @announcement.save
      redirect_to admin_announcements_path,
                  success: t('.success', title: @announcement.title)
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @announcement.update_attributes(announcement_params)
      redirect_to admin_announcements_path,
                  success: t('.success', title: @announcement.title)
    else
      render 'edit'
    end
  end

  def destroy
    if @announcement.destroy
      redirect_to admin_announcements_path,
                  success: t('.success', title: @announcement.title)
    else
      redirect_to admin_announcements_path, danger: t('.failure')
    end
  end

  private

  def announcement_params
    params.require(:announcement).permit(:title, :content, :valid_from, :valid_to)
  end
end
