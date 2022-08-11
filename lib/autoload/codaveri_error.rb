# frozen_string_literal: true
class CodaveriError < StandardError
  def initialize(message = nil)
    super(message || 'Codaveri might be moody :(. Please try again later or contact admin')
  end
end
