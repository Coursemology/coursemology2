# frozen_string_literal: true
module Course::Statistics::AggregateHelper
  # Convert time in seconds to HH:MM:SS format.
  def seconds_to_str(total_seconds)
    return '--:--:--' unless total_seconds

    seconds = total_seconds % 60
    minutes = (total_seconds / 60) % 60
    hours = (total_seconds / (60 * 60)) % 24
    days = total_seconds / (60 * 60 * 24)

    format("%2d #{t('time.day')} %02d:%02d:%02d", days, hours, minutes, seconds)
  end

  def time_overdue(submitted_at, end_at)
    expected_submission_time = submitted_at || Time.now
    return nil if !end_at || expected_submission_time.to_i < end_at.to_i

    expected_submission_time.to_i - end_at.to_i
  end
end
