module Devise::SignInCallbacks
  extend ActiveSupport::Concern

  included do
    define_callbacks :sign_in
  end

  module ClassMethods
    def after_sign_in(*args, &block)
      set_callback(:sign_in, :after, *args, &block)
    end

    def before_sign_in(*args, &block)
      set_callback(:sign_in, :before, *args, &block)
    end
  end
end
