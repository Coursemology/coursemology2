# frozen_string_literal: true
class System::Admin::Controller < ApplicationController
  before_action :authorize_admin

  private

  def authorize_admin
    authorize!(:manage, :all)
  end
end
