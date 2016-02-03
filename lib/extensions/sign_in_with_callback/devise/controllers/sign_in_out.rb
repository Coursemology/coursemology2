# frozen_string_literal: true
module Extensions::SignInWithCallback::Devise::Controllers::SignInOut
  class << self
    def included(module_)
      module_.alias_method_chain :sign_in, :callback
    end
  end

  def sign_in_with_callback(resource_or_scope, *args)
    original_args = args.dup
    original_args.extract_options!
    resource = original_args.last || resource_or_scope

    if resource.class.included_modules.include?(Devise::SignInCallbacks)
      resource.run_callbacks :sign_in do
        sign_in_without_callback(resource_or_scope, *args)
      end
    else
      sign_in_without_callback(resource_or_scope, *args)
    end
  end
end
