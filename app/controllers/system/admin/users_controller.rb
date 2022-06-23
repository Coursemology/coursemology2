# frozen_string_literal: true
class System::Admin::UsersController < System::Admin::Controller
  load_and_authorize_resource :user, class: User.name
  add_breadcrumb :index, :admin_users_path

  def index
    load_users
    load_counts
    @instances_preload_service = User::InstancePreloadService.new(@users.map(&:id))
  end

  def update
    @instances_preload_service = User::InstancePreloadService.new(@user.id)
    if @user.update(user_params)
      render 'system/admin/users/_user_list_data',
             locals: { user: @user },
             status: :ok
    else
      render json: { errors: @user.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def destroy
    if @user.destroy
      head :ok
    else
      render json: { errors: @user.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def load_users
    @users = @users.human_users.includes(:emails).ordered_by_name.page(page_param).search(search_param)
    @users = @users.active_in_past_7_days if params[:active]
    @users = @users.where(role: params[:role]) if params[:role] && User.roles.key?(params[:role])
  end

  def load_counts
    @counts = {
      total: User.group(:role).count,
      active: User.active_in_past_7_days.group(:role).count
    }.with_indifferent_access
  end

  def user_params
    params.require(:user).permit(:name, :role)
  end

  def search_param
    params.permit(:search)[:search]
  end
end
