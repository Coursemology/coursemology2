# frozen_string_literal: true
class InstanceNotFoundError < StandardError
  def initialize(message = nil)
    super(message || 'Instance not found')
  end
end
