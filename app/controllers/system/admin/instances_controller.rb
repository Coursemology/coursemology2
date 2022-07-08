# frozen_string_literal: true
class System::Admin::InstancesController < System::Admin::Controller
  load_and_authorize_resource :instance, class: ::Instance.name
  add_breadcrumb :index, :admin_instances_path

  def index # :nodoc:
    @instances_count = Instance.count
    @instances = Instance.order_for_display.paginate(page_param).
                 calculated(:active_course_count, :course_count, :active_user_count, :user_count)
  end

  def new # :nodoc:
  end

  def create # :nodoc:
    if @instance.save
      render 'system/admin/instances/_instance_list_data',
             locals: { instance: @instance },
             status: :ok
    else
      render json: { errors: @instance.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def edit # :nodoc:
  end

  def update # :nodoc:
    if @instance.update(instance_params)
      render 'system/admin/instances/_instance_list_data',
             locals: { instance: @instance },
             status: :ok
    else
      render json: { errors: @instance.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def destroy # :nodoc:
    if @instance.destroy
      head :ok
    else
      render json: { errors: @user.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def instance_params # :nodoc:
    params.require(:instance).permit(:name, :host)
  end
end
