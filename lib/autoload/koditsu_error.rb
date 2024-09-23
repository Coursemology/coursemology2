# frozen_string_literal: true
class KoditsuError < StandardError
  def initialize(message = nil)
    super(message || 'Koditsu might be moody :(. Please try again later or contact admin')
  end
end
