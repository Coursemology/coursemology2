# frozen_string_literal: true

class InstanceUserRoleRequestMailer < ApplicationMailer
  helper ApplicationFormattersHelper

  # Emails an admin, informing him of the role request.
  #
  # @param [Instance::UserRoleRequest] request The role request request.
  # @param [User] recipient the recipient, normally the instance or global admin.
  def new_role_request(request, recipient)
    @recipient = recipient
    @request = request

    mail(to: @recipient.email, subject: t('.subject'))
  end

  # Emails an admin, informing him of the role request.
  #
  # @param [InstanceUser] instance_user The instance user whose request has been approved.
  def role_request_approved(instance_user)
    return if instance_user.normal?

    @instance_user = instance_user
    @recipient = instance_user.user

    ActsAsTenant.without_tenant do
      @instance = instance_user.instance
    end

    mail(to: instance_user.user.email, subject: t('.subject'))
  end

  # Emails an admin, informing him of the role request.
  #
  # @param [InstanceUser] instance_user The instance user whose request has been rejected with message.
  def role_request_rejected(instance_user, message)
    @instance_user = instance_user
    @recipient = instance_user.user

    ActsAsTenant.without_tenant do
      @instance = instance_user.instance
      @message = message
    end

    mail(to: instance_user.user.email, subject: t('.subject'))
  end
end
