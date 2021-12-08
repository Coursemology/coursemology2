# frozen_string_literal: true
Recaptcha.configure do |config|
  if Rails.env.production?
    config.site_key = ENV['GOOGLE_RECAPTCHA_SITE_KEY']
    config.secret_key = ENV['GOOGLE_RECAPTCHA_SECRET_KEY']
  else
    # The following keys are for test and development environments only.
    # You will always get No CAPTCHA and all verification requests will pass.
    config.site_key = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
    config.secret_key = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'
  end
end
