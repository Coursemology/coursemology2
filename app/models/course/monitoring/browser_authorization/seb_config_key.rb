# frozen_string_literal: true
class Course::Monitoring::BrowserAuthorization::SebConfigKey < Course::Monitoring::BrowserAuthorization::Base
  # @see https://safeexambrowser.org/developer/seb-config-key.html
  def valid_heartbeat?(heartbeat)
    seb_payload = heartbeat.seb_payload&.with_indifferent_access
    return false unless seb_payload

    url = seb_payload[:url]
    hash = Digest::SHA256.hexdigest("#{url}#{@monitor.seb_config_key}")
    hash == seb_payload[:config_key_hash]
  end
end
