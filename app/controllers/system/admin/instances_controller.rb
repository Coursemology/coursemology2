# frozen_string_literal: true
class System::Admin::InstancesController < System::Admin::Controller
  load_and_authorize_resource :instance, class: '::Instance'

  def index
    respond_to do |format|
      format.json do
        preload_instances
      end
    end
  end

  def create
    if @instance.save
      preload_instances
      render 'index', format: :json
    else
      render json: { errors: @instance.errors }, status: :bad_request
    end
  end

  def update
    if @instance.update(instance_params)
      render 'system/admin/instances/_instance_list_data',
             locals: { instance: @instance },
             status: :ok
    else
      render json: { errors: @instance.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def destroy
    if @instance.destroy
      head :ok
    else
      render json: { errors: @instance.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def instance_params
    params.require(:instance).permit(:name, :host)
  end

  def preload_instances
    @instances_count = Instance.count
    @instances = Instance.order_for_display.
                 calculated(:active_course_count, :course_count, :active_user_count, :user_count)
  end
end
