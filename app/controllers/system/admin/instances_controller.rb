class System::Admin::InstancesController < System::Admin::Controller
  load_and_authorize_resource
  add_breadcrumb :index, :admin_instances_path

  def index #:nodoc:
    @instances = @instances.with_course_count.with_user_count
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
  end

  private

  def instance_params #:nodoc:
    params.require(:instance).permit(:name, :host)
  end
end
