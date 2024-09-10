# frozen_string_literal: true
module Course::Assessment::Monitoring::SebPayloadConcern
  extend ActiveSupport::Concern

  private

  def seb_payload_from_request(request)
    url = request.headers['X-SafeExamBrowser-Url']
    seb_config_key_hash = request.headers['X-SafeExamBrowser-ConfigKeyHash']
    return unless url && seb_config_key_hash

    # It's safe to not strip URL fragments (#) here because fragments are never sent to the server.
    { config_key_hash: seb_config_key_hash, url: url }
  end

  def stub_heartbeat_from_request(request)
    Course::Monitoring::Heartbeat.new(
      user_agent: request.user_agent,
      seb_payload: seb_payload_from_request(request)
    )
  end
end
