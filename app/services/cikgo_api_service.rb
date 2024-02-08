# frozen_string_literal: true
class CikgoApiService
  CIKGO_ENDPOINT = 'http://localhost:3000/api/v1'

  class << self
    def ping(push_key)
      response = connection('repositories', query: { pushKey: push_key }).get(expects: [200])
      { status: :ok, **parse_json(response.body) }
    rescue StandardError
      { status: :error }
    end

    def push(push_key, repository)
      connection('repositories', body: { pushKey: push_key, repository: repository }.to_json).post
    end

    def mark_task(status, data)
      connection('tasks', body: {
        resourceId: data[:item_id].to_s,
        repositoryId: "coursemology##{data[:course_id]}",
        status: status,
        provider: 'coursemology',
        userId: data[:user_id].to_s,
        url: data[:url]
      }.compact.to_json).patch
    end

    def push_item(push_key, repository)
      connection('repositories', body: { pushKey: push_key, repository: repository }.to_json).patch
    end

    def sync_chat_room(room_id)
      response = connection("chats/#{room_id}").get
      parse_json(response.body)
    end

    def authenticate(user, image)
      access_token = Doorkeeper::AccessToken.find_or_create_for(
        application: Doorkeeper::Application.find_by(name: 'testing app'),
        resource_owner: user,
        scopes: [],
        expires_in: Doorkeeper.configuration.access_token_expires_in
      )

      response = connection('auth', body: {
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
      }.to_json).post

      parse_json(response.body)[:userId]
    end

    def create_chat_room(story_id, user_id)
      response = connection('chats', body: {
        userId: user_id.to_s,
        storyId: story_id.to_s
      }.to_json).post

      parse_json(response.body)[:roomId]
    end

    private

    def connection(path, options = {})
      Excon.new(
        "#{CIKGO_ENDPOINT}/#{path}",
        headers: { Authorization: "Bearer #{ENV.fetch('CIKGO_API_KEY')}" },
        **options
      )
    end

    def parse_json(json)
      JSON.parse(json, symbolize_names: true)
    rescue JSON::ParserError
      nil
    end
  end
end
