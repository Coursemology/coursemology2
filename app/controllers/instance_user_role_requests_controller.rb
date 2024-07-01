# frozen_string_literal: true
class InstanceUserRoleRequestsController < ApplicationController
  load_and_authorize_resource :user_role_request, through: :current_tenant, parent: false,
                                                  class: '::Instance::UserRoleRequest'
  def index
    @user_role_requests = @user_role_requests.includes(:confirmer, :user)

    respond_to do |format|
      format.json
    end
  end

  def create
    @user_role_request.user = current_user
    if @user_role_request.save
      @user_role_request.send_new_request_email(current_tenant)
      render json: { id: @user_role_request.id }, status: :ok
    else
      render json: { errors: @user_role_request.errors }, status: :bad_request
    end
  end

  def update
    if @user_role_request.pending? && @user_role_request.update(user_role_request_params)
      render json: { id: @user_role_request.id }, status: :ok
    else
      render json: { errors: @user_role_request.errors }, status: :bad_request
    end
  end

  def approve
    @user_role_request.assign_attributes(user_role_request_params)

    @success, instance_user = @user_role_request.approve!
    if @success && @user_role_request.save
      InstanceUserRoleRequestMailer.role_request_approved(instance_user).deliver_later
      render partial: 'instance_user_role_request_list_data', locals: { role_request: @user_role_request }, status: :ok
    else
      render json: { errors: instance_user.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def reject
    if @user_role_request.update(user_role_request_rejection_params.reverse_merge(reject: true))
      send_rejection_email
      render partial: 'instance_user_role_request_list_data', locals: { role_request: @user_role_request }, status: :ok
    else
      render json: { errors: @user_role_request.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def user_role_request_params
    params.require(:user_role_request).permit(:role, :organization, :designation, :reason)
  end

  def user_role_request_rejection_params
    params.fetch(:user_role_request, {}).permit(:rejection_message)
  end

  def send_rejection_email
    @instance_user = InstanceUser.find_by(user_id: @user_role_request.user_id)
    InstanceUserRoleRequestMailer.role_request_rejected(@instance_user, @user_role_request.rejection_message).
      deliver_later
  end
end
