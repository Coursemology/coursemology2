# frozen_string_literal: true
class System::Admin::AnnouncementsController < System::Admin::Controller
  load_and_authorize_resource :announcement, class: System::Announcement.name
  add_breadcrumb :index, :admin_announcements_path

  def index
    @announcements = @announcements.includes(:creator).ordered_by_date.page(page_param)
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
    if @announcement.update(announcement_params)
      redirect_to admin_announcements_path,
                  success: t('.success', title: @announcement.title)
    else
      render 'edit'
    end
  end

  def destroy
    if @announcement.destroy
      redirect_to admin_announcements_path,
                  success: t('.success',
                             title: @announcement.title)
    else
      redirect_to admin_announcements_path,
                  danger: t('.failure', error: @announcement.errors.full_messages.to_sentence)
    end
  end

  private

  def announcement_params
    params.require(:system_announcement).permit(:title, :content, :start_at, :end_at)
  end
end
