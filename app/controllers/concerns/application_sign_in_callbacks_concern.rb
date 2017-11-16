# frozen_string_literal: true
module ApplicationSignInCallbacksConcern
  extend ActiveSupport::Concern

  def sign_in(resource_or_scope, *args)
    original_args = args.dup
    original_args.extract_options!
    resource = original_args.last || resource_or_scope

    if resource.class.included_modules.include?(Devise::SignInCallbacks)
      resource.run_callbacks :sign_in do
        super
      end
    else
      super
    end
  end
end
