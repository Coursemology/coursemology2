class ComponentNotFoundError < StandardError
  def initialize
    super('The component was disabled or does not exist'.freeze)
  end
end
