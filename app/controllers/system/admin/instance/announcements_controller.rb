# frozen_string_literal: true
class System::Admin::Instance::AnnouncementsController < System::Admin::Instance::Controller
  load_and_authorize_resource :announcement, through: :current_tenant, parent: false,
                                             class: ::Instance::Announcement.name
  add_breadcrumb :index, :admin_instance_announcements_path

  def index
    respond_to do |format|
      format.html { render 'system/admin/instance/admin/index' }
      format.json do
        @announcements = @announcements.includes(:creator)
      end
    end
  end

  def create
    if @announcement.save
      render 'course/announcements/_announcement_list_data',
             locals: { announcement: @announcement },
             status: :ok
    else
      render json: { errors: @announcement.errors }, status: :bad_request
    end
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
