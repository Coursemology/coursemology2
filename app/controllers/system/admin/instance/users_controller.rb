# frozen_string_literal: true
class System::Admin::Instance::UsersController < System::Admin::Instance::Controller
  load_and_authorize_resource :instance_user, class: InstanceUser.name,
                                              parent: false, except: [:index]
  add_breadcrumb :index, :admin_instance_users_path

  def index
    load_instance_users
    load_counts
  end

  def update
    if @instance_user.update(instance_user_params)
      flash.now[:success] = t('.success', user: @instance_user.user.name)
    else
      flash.now[:danger] = @instance_user.errors.full_messages.to_sentence
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

  def load_instance_users
    @instance_users = @instance.instance_users.includes(user: [:emails, :courses]).
                      page(page_param).search_and_ordered_by_username(search_param)
    @instance_users = @instance_users.active_in_past_7_days if params[:active]
    @instance_users = @instance_users.where(role: params[:role]) \
      if params[:role] && InstanceUser.roles.key?(params[:role])
  end

  def load_counts
    @counts = {
      total: current_tenant.instance_users.group(:role).count,
      active: current_tenant.instance_users.active_in_past_7_days.group(:role).count
    }.with_indifferent_access
  end

  def instance_user_params
    params.require(:instance_user).permit(:role)
  end

  def search_param
    params.permit(:search)[:search]
  end
end
