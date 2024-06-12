# frozen_string_literal: true
class SubjobNotCompletedError < StandardError
  def initialize(message = self.class.name)
    super
  end
end
