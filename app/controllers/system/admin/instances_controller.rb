class System::Admin::InstancesController < System::Admin::Controller
  load_and_authorize_resource :instance, class_name: ::Instance.name
  add_breadcrumb :index, :admin_instances_path

  def index #:nodoc:
    @instances = Instance.order_by_id.page(page_param).calculated(:course_count, :user_count)
  end

  def new #:nodoc:
  end

  def create #:nodoc:
    if @instance.save
      redirect_to admin_instances_path, success: t('.success')
    else
      render 'new'
    end
  end

  def edit #:nodoc:
  end

  def update #:nodoc:
    if @instance.update_attributes(instance_params)
      redirect_to admin_instances_path, success: t('.success')
    else
      render 'edit'
    end
  end

  def destroy #:nodoc:
    if @instance.destroy
      redirect_to admin_instances_path, success: t('.success', instance: @instance.name)
    else
      redirect_to admin_instances_path,
                  danger: t('.failure', error: @instance.errors.full_messages.to_sentence)
    end
  end

  private

  def instance_params #:nodoc:
    params.require(:instance).permit(:name, :host)
  end
end
