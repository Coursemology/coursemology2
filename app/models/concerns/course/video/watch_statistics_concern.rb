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
    starts, ends = start_and_end_times.values_at(:start, :end)
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

  EVENT_TYPES = { start: ['play', 'seek_end'], end: ['pause', 'seek_start', 'end'] }.freeze

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

  # The video times for the interval starts and ends.
  #
  # This method iterates through all relevant start and end events across video sessions,
  # sorted by session_id and sequence_num, to find all interval start events
  # and corresponding end events to push into respective arrays.
  #
  # @return [Hash<Symbol, [Integer]>] The hash containing arrays of start times and end times.
  def start_and_end_times
    video_duration = (is_a? Course::Video) ? duration : video.duration
    result = { start: [], end: [] }
    relevant_events_scope.all_start_and_end_events.to_a.group_by { |d| d[:session_id] }.each do |_, session_events|
      session_intervals = filter_interval_events(session_events, video_duration)
      result[:start] += session_intervals[:start]
      result[:end] += session_intervals[:end]
    end
    result.transform_values(&:sort)
  end

  # This method iterates through all start and end events belonging to a single session,
  # sorted by sequence_num, to generate a hash contaning arrays of start times and end times.
  #
  # @param [Array<Course::Video::Events>] session_events Array of events in the same session,
  # ordered by sequence_num
  # @param [int] video_duration The video duration, in seconds
  #
  # @return [Hash<Symbol, [Integer]>] The hash containing arrays of start times and end times.
  def filter_interval_events(session_events, video_duration)
    result = { start: [], end: [] }
    hash_keys = [:start, :end].cycle
    last_start, flag = nil, hash_keys.next
    session_events.each do |event|
      next if EVENT_TYPES[flag].exclude?(event.event_type)

      last_start = event if flag == :start
      result[flag] << correct_interval(event, last_start, video_duration)
      flag = hash_keys.next
    end
    handle_unclosed_interval(result, last_start, video_duration)
  end

  # This method parses video time from interval events, either start or end.
  # It also handles edge cases by:
  # replacing interval start's video_time with 0 when user presses start at the end of the video
  # replacing interval end's video_time with an approximate value when the recorded interval is regative
  #
  # @param [Course::Video:Event] event The event to parse video_time from, i.e. current event
  # @param [Course::Video:Event] last_start The start event observed right before current event
  # in the same session
  # @param [int] video_duration The video duration, in seconds
  #
  # @return [int] The video time at which the event was recorded
  def correct_interval(event, last_start, video_duration)
    if (EVENT_TYPES[:start].include? event.event_type) && event.video_time == video_duration
      0
    elsif (EVENT_TYPES[:end].include? event.event_type) && event.video_time < last_start.video_time
      [(last_start.video_time + last_start.playback_rate *
        (event.event_time - last_start.event_time)).to_i, video_duration].min
    else
      event.video_time
    end
  end

  # This method handles unclosed intervals by:
  # 1. adding session's last_video_time, or
  # 2. HACK: removing the last interval start if option 1 results in a negative interval
  # The hack is necessary to handle cases where the last request from VideoPlayer is lost,
  # resulting in an unclosed start, and session's last_video_time to be outdated.
  #
  # @param [Hash<Symbol, [Integer]>] result The hash containing arrays of start times and end times.
  # @param [Course::Video::Event] last_start The last start event in the session
  # @param [int] video_duration The video duration, in seconds
  #
  # @return [Hash<Symbol, [Integer]>] The hash containing arrays of start times and end times
  # of closed intervals.
  def handle_unclosed_interval(result, last_start, video_duration)
    if [result[:end].size, 0].include? result[:start].size
      result
    elsif last_start.session.last_video_time > correct_interval(last_start, last_start, video_duration)
      result[:end] << last_start.session.last_video_time
    else
      result[:start].pop
    end
    result
  end
end
