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
    if @user.update(user_params)
      flash.now[:success] = t('.success', user: @user.name)
    else
      flash.now[:danger] = @user.errors.full_messages.to_sentence
    end
  end

  def destroy
    if @user.destroy
      redirect_to admin_users_path, success: t('.success', user: @user.name)
    else
      redirect_to admin_users_path, danger: @user.errors.full_messages.to_sentence
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
