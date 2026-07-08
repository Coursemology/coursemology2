# frozen_string_literal: true
# Override Devise::Mailer to set the host for Devise emails
class DeviseMailer < Devise::Mailer
  def confirmation_instructions(record, token, opts = {})
    @tenant_host = opts.delete(:host)
    super
  end

  def reset_password_instructions(record, token, opts = {})
    @tenant_host = opts.delete(:host)
    super
  end

  private

  def default_url_options
    @tenant_host ? super.merge(host: @tenant_host) : super
  end
end
