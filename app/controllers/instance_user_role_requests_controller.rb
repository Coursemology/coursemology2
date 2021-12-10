# frozen_string_literal: true
class InstanceUserRoleRequestsController < ApplicationController
  load_and_authorize_resource :user_role_request, through: :current_tenant, parent: false,
                                                  class: ::Instance::UserRoleRequest.name
  def index
    add_breadcrumb current_tenant.name, :admin_instance_admin_path
    add_breadcrumb :index, :instance_user_role_requests_path
    @user_role_requests = @user_role_requests.includes(:confirmer, :user)
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
    @user_role_request.update!(user_role_request_params)

    @success, instance_user = @user_role_request.approve!
    if @success && @user_role_request.save!
      InstanceUserRoleRequestMailer.role_request_approved(instance_user).deliver_later
      flash.now[:success] = t('.success', user: instance_user.user.name, role: instance_user.role)
    else
      flash.now[:danger] = instance_user.errors.full_messages.to_sentence
    end
  end

  def reject
    if reject_role_request
      send_rejection_email
      success_message = if @user_role_request.rejection_message
                          t('.success_with_email', user: @instance_user.user.name)
                        else
                          t('.success', user: @instance_user.user.name)
                        end
      redirect_to instance_user_role_requests_path, success: success_message
    else
      redirect_to instance_user_role_requests_path, danger: t('.failure')
    end
  end

  private

  def user_role_request_params
    params.require(:user_role_request).permit(:role, :organization, :designation, :reason)
  end

  def user_role_request_rejection_params
    params.fetch(:user_role_request, {}).permit(:rejection_message)
  end

  def reject_role_request
    @user_role_request.update!(user_role_request_rejection_params) && @user_role_request.update!(reject: true)
  end

  def send_rejection_email
    @instance_user = InstanceUser.find_by(user_id: @user_role_request.user_id)
    InstanceUserRoleRequestMailer.role_request_rejected(@instance_user, @user_role_request.rejection_message).
      deliver_later
  end
end
