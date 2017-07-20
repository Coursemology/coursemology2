# frozen_string_literal: true
class InstanceUserRoleRequestsController < ApplicationController
  load_and_authorize_resource :user_role_request, through: :current_tenant, parent: false,
                                                  class: ::Instance::UserRoleRequest.name
  def new
  end

  def create
    @user_role_request.user = current_user
    if @user_role_request.save
      redirect_to courses_path, success: t('.success')
    else
      render 'new'
    end
  end

  private

  def user_role_request_params
    params.require(:user_role_request).permit(:role, :organization, :designation, :reason)
  end
end
