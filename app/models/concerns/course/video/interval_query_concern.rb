# frozen_string_literal: true
module Course::Video::IntervalQueryConcern
  extend ActiveSupport::Concern

  module ClassMethods
    def type_sym_to_id(symbols)
      symbols.map { |sym| Course::Video::Event.event_types[sym] }
    end
  end

  included do
    START_TYPES = [:play, :seek_end].freeze
    END_TYPES = [:pause, :seek_start, :end].freeze

    scope :start_events, -> { where(event_type: type_sym_to_id(START_TYPES)) }
    scope :end_events, -> { where(event_type: type_sym_to_id(END_TYPES)) }

    # @!method self.all_start_and_end_events
    #   Returns all events of start-types or end_types,
    #   sorted first by session then by sequence number inside the same session
    scope :all_start_and_end_events, lambda {
      where(event_type: type_sym_to_id(START_TYPES + END_TYPES)).
        unscope(:order).
        order(:session_id, :sequence_num).
        includes(session: { submission: :video }).
        references(:all)
    }
  end
end
