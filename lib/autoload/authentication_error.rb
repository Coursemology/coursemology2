# frozen_string_literal: true
class AuthenticationError < StandardError
  def initialize(message = self.class.name)
    super
  end
end
