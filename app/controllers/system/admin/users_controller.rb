class System::Admin::UsersController < System::Admin::Controller
  load_and_authorize_resource :user, class: User.name
  add_breadcrumb :index, :admin_users_path

  def index
    @users = @users.ordered_by_name.includes(:emails).page(params[:page])
  end

  def update
    if @user.update_attributes(user_params)
      redirect_to admin_users_path, success: t('.success', user: @user.name)
    else
      redirect_to admin_users_path, danger: @user.errors.full_messages.to_sentence
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

  def user_params
    params.require(:user).permit(:role)
  end
end
