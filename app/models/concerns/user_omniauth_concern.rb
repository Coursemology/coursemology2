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
    # @return [User|nil] The user found or nil.
    def find_by_omniauth(auth)
      identity = User::Identity.find_by(provider: auth.provider, uid: auth.uid)
      identity.user if identity
    end

    # Create a user from omniauth data.
    #
    # @param [OmniAuth::AuthHash] auth The data with omniauth info.
    # @return [User] The user created by omniauth data.
    def create_by_omniauth(auth)
      User.create do |user|
        user.assign_attributes(name: auth.info.name, email: auth.info.email,
                               password: Devise.friendly_token[0, 20])
        user.identities.build(provider: auth.provider, uid: auth.uid)
      end
    end
  end
end
