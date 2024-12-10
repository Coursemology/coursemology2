# frozen_string_literal: true
class PriorityShouldBeLoweredError < StandardError
  def initialize(message = nil)
    super(message || 'Priority for this job needs to be lowered')
  end
end
