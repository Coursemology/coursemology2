# frozen_string_literal: true
class DuplicationTraceable < ApplicationRecord
  actable

  validates :actable_type, length: { maximum: 255 }, allow_nil: true
  validates :actable_type, uniqueness: { scope: [:actable_id], allow_nil: true,
                                         if: -> { actable_id? && actable_type_changed? } }
  validates :actable_id, uniqueness: { scope: [:actable_type], allow_nil: true,
                                       if: -> { actable_type? && actable_id_changed? } }

  ALL_DUPLICATION_TRACEABLES = [
    DuplicationTraceable::Course.name,
    DuplicationTraceable::Assessment.name
  ].freeze

  class << self
    def duplication_traceable_class_of(dependent_object)
      dependent_class_to_duplication_traceable_class_mapping[dependent_object.class.name].constantize
    end

    private

    # Finds the mapping of dependent classes to duplication traceable classes. For example,
    # {
    #   'Course' => ['DuplicationTraceable::Course']
    #   'Course::Assessment' => ['DuplicationTraceable::Assessment']
    # }
    def dependent_class_to_duplication_traceable_class_mapping
      mappings = Hash.new { |h, k| h[k] = nil }

      DuplicationTraceable::ALL_DUPLICATION_TRACEABLES.map do |traceable|
        dependent_class = traceable.constantize.dependent_class
        mappings[dependent_class] = traceable unless dependent_class.nil?
      end

      mappings
    end
  end
end
