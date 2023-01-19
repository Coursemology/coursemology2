# frozen_string_literal: true
require 'rspec/expectations'

module ReferenceTimelinesTestHelper
  # Checks whether two `Course::ReferenceTimeline`s are similar to each other.
  #
  # Note that this is not a check for equality or equivalency, but similarity. This method is meant to compare
  # two timelines that were duplicated when duplicating a course. As such, it checks for the equivalency of the
  # attributes in both `Course::ReferenceTimeline` records.
  #
  # @param timeline1 [Course::ReferenceTimeline] a timeline
  # @param timeline2 [Course::ReferenceTimeline] the timeline to compare against `timeline1`
  # @param time_shift [ActiveSupport::Duration] number of days expected to be between the times in both timelines
  # @return [Boolean] `true` if both timelines are similar to each other
  #
  # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
  def similar_timelines?(timeline1, timeline2, time_shift = 0.day)
    return false unless timeline1.title == timeline2.title

    times1 = timeline1.reference_times
    times2 = timeline2.reference_times
    return false unless times1.size == times2.size

    times1.each_with_index do |time1, index|
      time2 = times2[index]
      return false unless time1.lesson_plan_item.actable_type == time2.lesson_plan_item.actable_type
      return false unless time1.lesson_plan_item.title == time2.lesson_plan_item.title
      return false unless days_equal_or_offset_by(time1.start_at, time2.start_at, time_shift)
      return false unless days_equal_or_offset_by(time1.bonus_end_at, time2.bonus_end_at, time_shift)
      return false unless days_equal_or_offset_by(time1.end_at, time2.end_at, time_shift)
    end

    true
  end
  # rubocop:enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity

  private

  # Checks whether two times are equal or differ by some given number of days.
  #
  # @param time1 [ActiveSupport::TimeWithZone, nil] a time
  # @param time2 [ActiveSupport::TimeWithZone, nil] the time to compare against `time1`
  # @param offset [ActiveSupport::Duration] number of days expected to be between `time1` and `time2`
  # @return [Boolean] `true` if `time1` and `time2` are equal, or differ by `offset` days
  def days_equal_or_offset_by(time1, time2, offset)
    return true if time1 == time2

    days_between(time1, time2) == offset
  end

  # Returns the number of days between two `ActiveSupport::TimeWithZone` times.
  # It returns `0.days` if either time is `nil`.
  #
  # @param time1 [ActiveSupport::TimeWithZone, nil] a time
  # @param time2 [ActiveSupport::TimeWithZone, nil] the time to differ against `time1`
  # @return [ActiveSupport::Duration] the number of days between `time1` and `time2`
  def days_between(time1, time2)
    return 0.days if time1.blank? || time2.blank?

    date1 = time1.to_date
    date2 = time2.to_date
    (date1 - date2).to_i.days
  end
end

RSpec::Matchers.define :be_similar_to_timeline do |expected, time_shift|
  include ReferenceTimelinesTestHelper

  match do |actual|
    expect(similar_timelines?(actual, expected, time_shift)).to be_truthy
  end
end

RSpec.configure do |config|
  config.include ReferenceTimelinesTestHelper
end
