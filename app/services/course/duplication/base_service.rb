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

  # Hands every duplicated assessment its own copy so it can record a marketplace adoption. Copies
  # made outside +Course::Assessment::Marketplace::DuplicationJob+ -- selected object duplications
  # and full course duplications that happen to carry an ADOPTED assessment along, most often a
  # course rolled forward for a new batch of students -- are adoptions too, and the listing has to know
  # about them to reach every course holding a copy.
  #
  # This sweep lives in the duplication service rather than in a model's +after_duplicate_save+
  # hook because that hook only runs for the top-level objects of an object duplication, and never
  # at all during a course duplication -- both of which are paths this has to cover. The per-copy
  # rule itself belongs to the assessment: see +Course::Assessment#record_marketplace_adoption+.
  #
  # Must be called inside the duplication transaction, after the duplicates have been saved.
  def record_marketplace_adoptions
    destination_course = @options[:destination_course] || duplicator.options[:destination_course]
    return unless destination_course

    duplicated_assessment_pairs.each do |source, duplicate|
      source.record_marketplace_adoption(duplicate, destination_course, @options[:current_user])
    end
  end

  # @return [Hash] Source-to-duplicate pairs for every assessment this duplication produced.
  def duplicated_assessment_pairs
    duplicator.duplicated_objects.select do |source, duplicate|
      source.is_a?(Course::Assessment) && duplicate&.persisted?
    end
  end
end
