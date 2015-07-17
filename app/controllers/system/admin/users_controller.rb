class System::Admin::UsersController < System::Admin::Controller
  load_and_authorize_resource :user, class: User.name
  add_breadcrumb :index, :admin_users_path

  def index
    @users = @users.ordered_by_name.includes(:emails).page(params[:page])
  end
end
