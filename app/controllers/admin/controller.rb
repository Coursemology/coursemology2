class Admin::Controller < ApplicationController
  before_filter :authorize_admin

  private

  def authorize_admin
    authorize!(:manage, current_tenant)
  end
end
