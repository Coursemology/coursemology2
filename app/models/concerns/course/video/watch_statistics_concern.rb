# frozen_string_literal: true
module Course::Video::WatchStatisticsConcern
  extend ActiveSupport::Concern

  # Computes the watch frequency given the scope of events.
  #
  # Watch frequency is a list denoting the number of times a certain point in the video has been
  # covered. In other words, each video time's frequency is the number of intervals (as computed
  # from events) that the time is present in.
  #
  # This method computes frequency for video times from 0 to the last interval end, not the
  # entire duration of the video.
  #
  # @return [[Integer]] The watch frequency, with the indices matching up to video time in seconds.
  def watch_frequency
    starts, ends = start_times, end_times
    start_index, end_index = 0, 0
    frequencies = []
    active_intervals = 0
    return [] if ends.empty?
    (0..ends.last).each do |video_time|
      start_advance = elements_till(starts, start_index) { |time| time <= video_time }
      end_advance = elements_till(ends, end_index) { |time| time < video_time }

      active_intervals += start_advance - end_advance
      start_index += start_advance
      end_index += end_advance

      frequencies << active_intervals
    end
    frequencies
  end

  private

  # The scope for events to compute statistics with.
  #
  # Implementations must return a database query scope, not an array, since the return value will
  # be converted to SQL.
  #
  # @return [ActiveRecord::Relation[Course::Video::Events]] The events to analyze.
  def relevant_events_scope
    raise NotImplementedError
  end

  # Counts the elements of a stack until a condition is fulfilled.
  #
  # @param [[Integer]] stack The stack to count.
  # @param [Integer] start_index The index to start counting from.
  # @param [&block] Elements from the stack will be yield to check for the termination condition
  # @return [Integer] The number of elements counted.
  def elements_till(stack, start_index)
    advance_count = 0
    advance_count += 1 while (start_index + advance_count) < stack.size &&
                             (yield stack[start_index + advance_count])
    advance_count
  end

  # The video times for the interval starts.
  #
  # @return [Integer] The start times.
  def start_times
    relevant_events_scope.
      interval_starts.
      unscope(:order).
      order(:video_time).
      pluck(:video_time)
  end

  # The video times for the interval ends.
  #
  # If no explicit end to an interval is recorded in an event, the last_video_time from the
  # session is taken as the interval end.
  #
  # @return [Integer] The end times.
  def end_times
    interval_end_query = relevant_events_scope.
                         interval_ends.
                         select('course_video_events.video_time AS end_time').
                         to_sql
    implict_end_query = relevant_events_scope.
                        unclosed_starts.
                        joins(:session).
                        select('course_video_sessions.last_video_time AS end_time').
                        to_sql

    ActiveRecord::Base.connection.
      exec_query("(#{implict_end_query}) UNION ALL (#{interval_end_query}) ORDER BY end_time").
      rows.
      map { |row| row[0] }
  end

  # The video times for the interval starts and ends.
  #
  # This method iterates through all relevant start and end events,
  # sorted by session_id and sequence_num, to find all interval start events
  # and corresponding end events to push into respective arrays.
  #
  # If a start event is followed by an event from another session, it is counted as an unclosed start,
  # and the last_video_time from the session is taken as the interval end.
  #
  # @return [Hash<Symbol, [Integer]>] The hash containing arrays of start times and end times.
  #
  # TODO: Remove logic to append last_video_time to end_times when session end event is implemented.
  # Session end event is an even fired from VideoPlayer onUnmount. When recorded in DB as an end event,
  # it can ensure that there would be no unclosed start, thereby rendering last_video_time redundant.
  def start_and_end_times
    result = { start_times: [], end_times: [] }
    hash_keys = [:start_times, :end_times].cycle
    session, flag = nil, hash_keys.next
    event_types = { start_times: ['play', 'seek_end'], end_times: ['pause', 'seek_start', 'end'] }
    relevant_events_scope.all_start_and_end_events.each do |event|
      if event.session != session
        if flag == :end_times
          result[:end_times] << session.last_video_time
          flag = hash_keys.next
        end
        session = event.session
      end
      if event_types[flag].include? event.event_type
        result[flag] << event.video_time
        flag = hash_keys.next
      end
    end
    result[:end_times] << session.last_video_time unless flag == :start_times || result[:start_times].empty?
    result.map { |k, v| [k, v.sort] }.to_h
  end
end
