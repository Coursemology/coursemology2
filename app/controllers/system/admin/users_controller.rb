# frozen_string_literal: true
class System::Admin::UsersController < System::Admin::Controller
  load_and_authorize_resource :user, class: User.name
  add_breadcrumb :index, :admin_users_path

  def index
    respond_to do |format|
      format.html { render 'system/admin/admin/index' }
      format.json do
        load_users
        load_counts
        @instances_preload_service = User::InstancePreloadService.new(@users.map(&:id))
      end
    end
  end

  def update
    @instances_preload_service = User::InstancePreloadService.new(@user.id)
    if @user.update(user_params)
      render 'system/admin/users/_user_list_data',
             locals: { user: @user },
             status: :ok
    else
      render json: { errors: @user.errors }, status: :bad_request
    end
  end

  def destroy
    if @user.destroy
      head :ok
    else
      render json: { errors: @user.errors }, status: :bad_request
    end
  end

  private

  def user_params
    params.require(:user).permit(:name, :role)
  end

  def search_param
    params.permit(:search)[:search]
  end

  def load_users
    @users = @users.human_users.includes(:emails).ordered_by_name.search(search_param)
    @users = @users.active_in_past_7_days if params[:active].present?
    @users = @users.where(role: params[:role]) if params[:role].present? && User.roles.key?(params[:role])
    @users_count = @users.count.is_a?(Hash) ? @users.count.count : @users.count
    @users = @users.paginated(new_page_params)
  end

  def load_counts
    @counts = {
      total: User.group(:role).count,
      active: User.active_in_past_7_days.group(:role).count
    }.with_indifferent_access
  end
end
