class IllegalStateError < StandardError
  def initialize(message = self.class.name)
    super
  end
end
