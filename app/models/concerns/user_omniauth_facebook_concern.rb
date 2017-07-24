# frozen_string_literal: true
module UserOmniauthFacebookConcern
  extend ActiveSupport::Concern

  module ClassMethods
    # A convenience method that receives both parameters and session to initialize a user.
    # This is a override of `Devise::Models::Registerable::ClassMethods#new_with_session`
    def new_with_session(params, session)
      super.tap do |user|
        facebook_data = session['devise.facebook_data']&.deep_symbolize_keys
        if facebook_data && (info = facebook_data[:info])
          user.name ||= info[:name] if info[:name]
          user.email ||= info[:email] if info[:email]
          user.link_with_omniauth(facebook_data)
        end
      end
    end
  end
end
