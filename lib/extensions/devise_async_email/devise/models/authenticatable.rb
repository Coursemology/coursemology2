# frozen_string_literal: true
module Extensions::DeviseAsyncEmail::Devise::Models::Authenticatable
  module PrependMethods
    def send_devise_notification(notification, *args)
      opts = args.extract_options!
      opts[:host] = ActsAsTenant.current_tenant.host if ActsAsTenant.current_tenant
      devise_mailer.send(notification, self, *args, opts).deliver_later(queue: :highest) # default :mailers
    end
  end
end
