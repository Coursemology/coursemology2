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
      render 'course/announcements/_announcement_list_data',
             locals: { announcement: @announcement },
             status: :ok
    else
      render json: { errors: @announcement.errors.full_messages.to_sentence }, status: :bad_request
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
      render json: { errors: @announcement.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def destroy
    if @announcement.destroy
      head :ok
      # redirect_to admin_announcements_path,
      #             success: t('.success',
      #                        title: @announcement.title)
    else
      render json: { errors: @announcement.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def announcement_params
    params.require(:system_announcement).permit(:title, :content, :start_at, :end_at)
  end
end
