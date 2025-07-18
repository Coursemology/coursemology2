# frozen_string_literal: true
class SsidError < StandardError
  def initialize(message = nil)
    super(message || 'SSID might be moody :(. Please try again later or contact admin')
  end
end
