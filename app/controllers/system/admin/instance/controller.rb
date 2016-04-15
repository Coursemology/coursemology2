# frozen_string_literal: true
class System::Admin::Instance::Controller < ApplicationController
  layout 'system_admin_instance'
  before_action :load_instance
  before_action :authorize_instance_admin
  before_action :add_instance_breadcrumb

  private

  def load_instance
    @instance = current_tenant
  end

  def authorize_instance_admin
    authorize!(:show, @instance)
  end

  def add_instance_breadcrumb
    add_breadcrumb @instance.name, :admin_instance_admin_path
  end
end
