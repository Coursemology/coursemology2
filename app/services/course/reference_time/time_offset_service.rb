# frozen_string_literal: true
class Course::ReferenceTime::TimeOffsetService
  class << self
    # Shift start_at, end_at and bonus_end_at for given Course::ReferenceTime
    #
    # @param [Array<Course::ReferenceTime>] times The array reference times to be shifted
    # @param [Int] shift_by_days The duration (in days) to shift
    # @param [Int] shift_by_hours The duration (in hours) to shift
    # @param [Int] shift_by_minutes The duration (in minutes) to shift
    delegate :shift_all_times, to: :new
  end

  def shift_all_times(times, shift_by_days, shift_by_hours, shift_by_minutes)
    shift_by = shift_by_days.days + shift_by_hours.hours + shift_by_minutes.minutes
    times.each do |time|
      time.start_at += shift_by if time.start_at
      time.end_at += shift_by if time.end_at
      time.bonus_end_at += shift_by if time.bonus_end_at
      time.save!
    end
  end
end
