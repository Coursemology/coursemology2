# frozen_string_literal: true
class ComponentNotFoundError < StandardError
  def initialize
    super('The component was disabled or does not exist')
  end
end
