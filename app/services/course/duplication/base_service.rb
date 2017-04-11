# frozen_string_literal: true

# Provides a base service to use the Duplicator Object. To use, define different duplication
# modes which inherits from this base service.
class Course::Duplication::BaseService
  attr_reader :duplicator

  # Base constructor for the service object.
  #
  # This also sets +@duplicator+ as the Duplicator object for the duplication service.
  #
  # @param [Hash] options The options to be sent to the Duplicator object.
  # @option options [String] :time_shift The time shift for timestamps between the courses.
  # @option options [Symbol] :mode The duplication mode provided by the service.
  # @raise [KeyError] When the options do not include time_shift and/or mode.
  def initialize(options = {})
    @options = options
    @duplicator = initialize_duplicator(options)
    return if options[:time_shift] && options[:mode]
    raise KeyError, 'Options must include both time_shift and mode'
  end

  private

  # Allows for the Duplication service class to initialise the Duplicator.
  #
  # @raise [NotImplementedError] Duplication classes should implement this method.
  def initialize_duplicator(*)
    raise NotImplementedError, 'To be implemented by specific duplication service.'
  end
end
