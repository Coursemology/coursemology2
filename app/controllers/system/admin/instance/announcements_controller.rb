# frozen_string_literal: true
class System::Admin::Instance::AnnouncementsController < System::Admin::Instance::Controller
  load_and_authorize_resource :announcement, through: :current_tenant, parent: false,
                                             class: ::Instance::Announcement.name
  add_breadcrumb :index, :admin_instance_announcements_path

  def index
    @announcements = @announcements.includes(:creator).page(page_param)
  end

  def new
  end

  def create
    if @announcement.save
      redirect_to admin_instance_announcements_path,
                  success: t('.success', title: @announcement.title)
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @announcement.update(announcement_params)
      render 'course/announcements/_announcement_list_data',
             locals: { announcement: @announcement.reload },
             status: :ok
    else
      render json: { errors: @announcement.errors }, status: :bad_request
    end
  end

  def destroy
    if @announcement.destroy
      head :ok
    else
      render json: { errors: @announcement.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def announcement_params
    params.require(:announcement).permit(:title, :content, :start_at, :end_at)
  end
end
