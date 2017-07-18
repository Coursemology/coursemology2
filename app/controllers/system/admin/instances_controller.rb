# frozen_string_literal: true
class System::Admin::InstancesController < System::Admin::Controller
  load_and_authorize_resource :instance, class: ::Instance.name
  add_breadcrumb :index, :admin_instances_path

  def index #:nodoc:
    @instances = Instance.order_for_display.page(page_param).
                 calculated(:active_course_count, :course_count, :active_user_count, :user_count)
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
