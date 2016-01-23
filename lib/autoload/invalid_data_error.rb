class InvalidDataError < StandardError
  def initialize(message = nil)
    super(message || 'The data is not in a valid format'.freeze)
  end
end
