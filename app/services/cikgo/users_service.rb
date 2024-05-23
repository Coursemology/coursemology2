# frozen_string_literal: true
class Cikgo::UsersService < Cikgo::Service
  class << self
    def authenticate!(user, provider_user_id, image)
      response = connection(:post, 'auth', body: {
        provider: 'coursemology-keycloak',
        name: user.name,
        email: user.email,
        emailVerified: user.confirmed?,
        image: image,
        providerUserId: provider_user_id
      })

      response[:userId]
    end
  end
end
