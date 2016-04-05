# frozen_string_literal: true
module Extensions::DeviseAsyncEmail::Devise::Models::Authenticatable
  module PrependMethods
    def send_devise_notification(notification, *args)
      devise_mailer.send(notification, self, *args).deliver_later
    end
  end
end
