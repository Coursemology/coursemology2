# frozen_string_literal: true
class System::Admin::Instance::UsersController < System::Admin::Instance::Controller
  load_and_authorize_resource :instance_user, class: 'InstanceUser',
                                              parent: false, except: [:index]

  def index
    respond_to do |format|
      format.json do
        load_instance_users
        load_counts
      end
    end
  end

  def update
    if @instance_user.update(instance_user_params)
      render 'system/admin/instance/users/_user_list_data',
             locals: { instance_user: @instance_user },
             status: :ok
    else
      render json: { errors: @instance_user.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def destroy
    if @instance_user.destroy
      head :ok
    else
      render json: { errors: @instance_user.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def load_instance_users
    @instance_users = @instance.instance_users.includes(user: [:emails, :courses]).
                      search_and_ordered_by_username(search_param)
    @instance_users = @instance_users.active_in_past_7_days if ActiveRecord::Type::Boolean.new.cast(params[:active])
    @instance_users = @instance_users.where(role: params[:role]) \
      if params[:role].present? && InstanceUser.roles.key?(params[:role])
    @instance_users_count = if @instance_users.count.is_a?(Hash)
                              @instance_users.count.count
                            else
                              @instance_users.count
                            end
    @instance_users = @instance_users.paginated(page_param)
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
