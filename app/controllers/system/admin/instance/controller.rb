class System::Admin::Instance::Controller < ApplicationController
  layout 'system_admin_instance'
  before_action :authorize_instance_admin
  before_action :add_instance_breadcrumb

  private

  def authorize_instance_admin
    authorize!(:manage, current_tenant)
  end

  def add_instance_breadcrumb
    add_breadcrumb current_tenant.name, :admin_instance_admin_path
  end
end
