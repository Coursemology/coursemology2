# frozen_string_literal: true
class Cikgo::RoomsService < Cikgo::Service
  class << self
    def completed?(room_id)
      response = connection(:get, "chats/#{room_id}")
      response[:completed] || false
    end

    def authenticate(user, image)
      access_token = find_or_create_oauth_tokens_for(user)

      response = connection(:post, 'auth', body: {
        provider: 'coursemology',
        name: user.name,
        email: user.email,
        emailVerified: user.confirmed?,
        image: image,
        providerUserId: user.id.to_s,
        oauth: {
          accessToken: access_token.token,
          refreshToken: access_token.refresh_token,
          expiresIn: access_token.expires_in,
          scope: access_token.scopes.to_s,
          tokenType: 'bearer'
        }
      })

      response[:userId]
    end

    def create_room(story_id, user_id)
      response = connection(:post, 'chats', body: {
        userId: user_id.to_s,
        storyId: story_id.to_s
      })

      response[:roomId]
    end

    private

    def find_or_create_oauth_tokens_for(user)
      Doorkeeper::AccessToken.find_or_create_for(
        application: Doorkeeper::Application.find_by(name: CIKGO_OAUTH_APPLICATION_NAME),
        resource_owner: user,
        scopes: [],
        expires_in: Doorkeeper.configuration.access_token_expires_in
      )
    end
  end
end
