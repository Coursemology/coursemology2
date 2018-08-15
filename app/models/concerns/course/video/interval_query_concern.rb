# frozen_string_literal: true
module Course::Video::IntervalQueryConcern
  extend ActiveSupport::Concern

  module ClassMethods
    def type_sym_to_id(symbols)
      symbols.map { |sym| Course::Video::Event.event_types[sym] }
    end
  end

  included do
    private_class_method :type_sym_to_id

    START_TYPES = [:play, :seek_end].freeze
    END_TYPES = [:pause, :seek_start, :end].freeze

    scope :start_events, -> { where(event_type: type_sym_to_id(START_TYPES)) }
    scope :end_events, -> { where(event_type: type_sym_to_id(END_TYPES)) }

    # @!method self.interval_starts
    #   Returns events that are considered to be an start of a watch interval.
    #
    #   An event can be considered an interval start if it is an start_event, and that it is the first
    #   start_event since the start of a session, or since an earlier end_event.
    scope :interval_starts, lambda {
      start_events.
        where('NOT EXISTS ('\
              'SELECT 1 FROM course_video_events AS prev_start '\
              'WHERE prev_start.event_type IN (:start_types) '\
                'AND prev_start.session_id = course_video_events.session_id '\
                'AND prev_start.sequence_num < course_video_events.sequence_num '\
                'AND NOT EXISTS ('\
                  'SELECT 1 FROM course_video_events AS middle_end '\
                  'WHERE middle_end.event_type IN (:end_types) '\
                    'AND middle_end.session_id = course_video_events.session_id '\
                    'AND middle_end.sequence_num > prev_start.sequence_num '\
                    'AND middle_end.sequence_num < course_video_events.sequence_num'\
                ')'\
            ')',
              start_types: type_sym_to_id(START_TYPES),
              end_types: type_sym_to_id(END_TYPES))
    }

    # @!method self.interval_ends
    #   Returns events that are considered to be an end of a watch interval.
    #
    #   An event can be considered an interval end if it is an end_event, and that it is the first
    #   end_event since a previous interval start.
    scope :interval_ends, lambda {
      end_events.
        where('EXISTS ('\
              'SELECT 1 FROM course_video_events AS prev_start '\
              'WHERE prev_start.event_type IN (:start_types) '\
                'AND prev_start.session_id = course_video_events.session_id '\
                'AND prev_start.sequence_num < course_video_events.sequence_num '\
                'AND NOT EXISTS ('\
                  'SELECT 1 FROM course_video_events AS middle_end '\
                  'WHERE middle_end.event_type IN (:end_types) '\
                    'AND middle_end.session_id = course_video_events.session_id '\
                    'AND middle_end.sequence_num > prev_start.sequence_num '\
                    'AND middle_end.sequence_num < course_video_events.sequence_num'\
                ')'\
            ')',
              start_types: type_sym_to_id(START_TYPES),
              end_types: type_sym_to_id(END_TYPES))
    }

    # @!method self.unclosed_starts
    #   Returns start_events that do not have an end_events after it in a session.
    #
    #   These intervals end at the end of the session.
    scope :unclosed_starts, lambda {
      interval_starts.
        where('NOT EXISTS ('\
              'SELECT 1 FROM course_video_events AS last_end '\
              'WHERE last_end.event_type IN (:end_types) '\
                'AND last_end.session_id = course_video_events.session_id '\
                'AND last_end.sequence_num > course_video_events.sequence_num'\
            ')',
              end_types: type_sym_to_id(END_TYPES))
    }
  end
end
