# frozen_string_literal: true
class System::Admin::Controller < ApplicationController
  layout 'system_admin'
  before_action :authorize_admin

  private

  def authorize_admin
    authorize!(:manage, :all)
  end

  add_breadcrumb :index, :admin_path
end
