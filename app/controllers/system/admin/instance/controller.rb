# frozen_string_literal: true
class System::Admin::Instance::Controller < ApplicationController
  before_action :load_instance
  before_action :authorize_instance_admin

  private

  def load_instance
    @instance = current_tenant
  end

  def authorize_instance_admin
    authorize!(:show, @instance)
  end
end
