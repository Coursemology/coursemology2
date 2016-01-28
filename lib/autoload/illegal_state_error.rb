# frozen_string_literal: true
class IllegalStateError < StandardError
  def initialize(message = self.class.name)
    super
  end
end
