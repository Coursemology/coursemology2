# frozen_string_literal: true
class Cikgo::UsersService < Cikgo::Service
  class << self
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

    private

    def find_or_create_oauth_tokens_for(user)
      Doorkeeper::AccessToken.find_or_create_for(
        application: Doorkeeper::Application.find_by(name: CIKGO_OAUTH_APPLICATION_NAME),
        resource_owner: user,
        scopes: StringThatRespondsToSort.new('read'),
        expires_in: Doorkeeper.configuration.access_token_expires_in,
        use_refresh_token: true
      )
    end

    # `Doorkeeper::AccessToken.find_or_create_for`'s documentation says that `scopes` can be any object that responds to
    # `to_s`. Examples in the community pass string, e.g., 'read' into `scopes`, and indeed `String`s respond to `to_s`.
    # However, passing 'read' to `scopes` raises an error that it doesn't respond to `sort`. Delving into Doorkeeper's
    # source code, we find that Doorkeeper lies and actually tried to call `sort` on `scopes`. So, we can pass an array
    # e.g., ['read'], but Doorkeeper will call `to_s` on `scopes` and save it as the `scopes` column value in the
    # `oauth_access_tokens` table, and we end up with a `scopes` value that looks like `['read']` or `[:read]`, which is
    # wrong. Other `Doorkeeper::AccessToken` that are created "properly" by Doorkeeper when authenticating via OAuth
    # have `scopes` values like `read`, no quotes.
    #
    # This class is therefore a workaround to make `scopes` respond to `to_s` (as prescribed explicitly) and `sort` (as
    # prescribed implicitly), while at the same time ensuring `scopes` is saved correctly in `oauth_access_tokens`.
    #
    # @see https://github.com/doorkeeper-gem/doorkeeper/blob/8626b8587b239984417f5094708007bc105d48b9/lib/doorkeeper/models/access_token_mixin.rb#L164
    class StringThatRespondsToSort < String
      def sort
      end
    end
  end
end
