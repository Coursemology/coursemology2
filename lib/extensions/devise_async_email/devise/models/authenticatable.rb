# frozen_string_literal: true
module Extensions::DeviseAsyncEmail::Devise::Models::Authenticatable
  module PrependMethods
    def send_devise_notification(notification, *args)
      deliver_queue = if [:confirmation_instructions, :reset_password_instructions].include?(notification)
                        :highest
                      else
                        :mailers
                      end
      devise_mailer.send(notification, self, *args).deliver_later(queue: deliver_queue)
    end
  end
end
