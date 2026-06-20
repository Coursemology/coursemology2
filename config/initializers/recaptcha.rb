# frozen_string_literal: true
Recaptcha.configure do |config|
  if Rails.env.production?
    config.site_key = Rails.application.credentials.dig(:google_recaptcha, :site_key)
    config.secret_key = Rails.application.credentials.dig(:google_recaptcha, :secret_key)
  else
    # The following keys are for test and development environments only.
    # You will always get No CAPTCHA and all verification requests will pass.
    config.site_key = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
    config.secret_key = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'
  end
end
