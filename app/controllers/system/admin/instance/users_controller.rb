class System::Admin::Instance::UsersController < System::Admin::Instance::Controller
  load_and_authorize_resource :instance_user, class: InstanceUser.name,
                                              parent: false, except: [:index]
  add_breadcrumb :index, :admin_instance_users_path

  def index
    @instance_users = @instance.instance_users.includes(user: [:emails, :courses]).
                      ordered_by_username.page(params[:page])
  end

  def update
    if @instance_user.update_attributes(instance_user_params)
      redirect_to admin_instance_users_path, success: t('.success', user: @instance_user.user.name)
    else
      redirect_to admin_instance_users_path, danger: @instance_user.errors.full_messages.to_sentence
    end
  end

  def destroy
    if @instance_user.destroy
      redirect_to admin_instance_users_path, success: t('.success', user: @instance_user.user.name)
    else
      redirect_to admin_instance_users_path, danger: @instance_user.errors.full_messages.to_sentence
    end
  end

  private

  def instance_user_params
    params.require(:instance_user).permit(:role)
  end
end
