# frozen_string_literal: true
class InstanceUserRoleRequestsController < ApplicationController
  load_and_authorize_resource :user_role_request, through: :current_tenant, parent: false,
                                                  class: ::Instance::UserRoleRequest.name
  def index
    add_breadcrumb current_tenant.name, :admin_instance_admin_path
    add_breadcrumb :index, :instance_user_role_requests_path
    render layout: 'system_admin_instance'
  end

  def new
  end

  def create
    @user_role_request.user = current_user
    if @user_role_request.save
      @user_role_request.send_new_request_email(current_tenant)
      redirect_to courses_path, success: t('.success')
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @user_role_request.update(user_role_request_params)
      redirect_to courses_path, success: t('.success')
    else
      render 'edit'
    end
  end

  def approve
    @user_role_request.assign_attributes(user_role_request_params)

    @success, instance_user = @user_role_request.approve_and_destroy!
    if @success
      InstanceUserRoleRequestMailer.role_request_approved(instance_user).deliver_later
      flash.now[:success] = t('.success', user: instance_user.user.name, role: instance_user.role)
    else
      flash.now[:danger] = instance_user.errors.full_messages.to_sentence
    end
  end

  def destroy
    redirect_to instance_user_role_requests_path, success: t('.success') if @user_role_request.destroy
  end

  private

  def user_role_request_params
    params.require(:user_role_request).permit(:role, :organization, :designation, :reason)
  end
end
