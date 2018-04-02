# frozen_string_literal: true
module UserOmniauthConcern
  extend ActiveSupport::Concern
  include UserOmniauthFacebookConcern

  included do
    devise :omniauthable
  end

  module ClassMethods
    # Find or create the user from omniauth data.
    #
    # @param [OmniAuth::AuthHash] auth The data with omniauth info.
    # @return [User] The user found or created.
    def find_or_create_by_omniauth(auth)
      find_by_omniauth(auth) || create_by_omniauth(auth)
    end

    # Find the user from omniauth data.
    #
    # @param [OmniAuth::AuthHash] auth The data with omniauth info.
    # @return [User] The user found.
    # @return [nil] If none is found.
    def find_by_omniauth(auth)
      identity = User::Identity.find_by(provider: auth.provider, uid: auth.uid)
      identity&.user
    end

    # Create a user from omniauth data.
    #
    # @param [OmniAuth::AuthHash] auth The data with omniauth info.
    # @return [User] The user created by omniauth data.
    def create_by_omniauth(auth)
      User.create do |user|
        user.assign_attributes(name: auth.info.name, email: auth.info.email,
                               password: Devise.friendly_token[0, 20])
        user.skip_confirmation! if user.email
        user.link_with_omniauth(auth)
      end
    end
  end

  # Link user with an omniauth provider.
  #
  # @param [OmniAuth::AuthHash|Hash] auth The data with omniauth info.
  def link_with_omniauth(auth)
    identities.find_or_initialize_by(provider: auth[:provider], uid: auth[:uid])
  end

  # Link user with an omniauth provider. This method would immediately set the attributes in the
  # database.
  #
  # @param [OmniAuth::AuthHash|Hash] auth The data with omniauth info.
  # @return [Boolean] True if success, otherwise false.
  def link_with_omniauth!(auth)
    link_with_omniauth(auth)
    save
  end
end
