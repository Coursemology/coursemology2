# frozen_string_literal: true
class InvalidDataError < StandardError
  def initialize(message = nil)
    super(message || 'The data is not in a valid format')
  end
end
