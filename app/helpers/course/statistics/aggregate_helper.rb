# frozen_string_literal: true
module Course::Statistics::AggregateHelper
  # get detailed info regarding days, hours, minutes, seconds
  def fetch_time_details(total_seconds)
    seconds = total_seconds % 60
    minutes = (total_seconds / 60) % 60
    hours = (total_seconds / (60 * 60)) % 24
    days = total_seconds / (60 * 60 * 24)

    [days, hours, minutes, seconds]
  end

  # Convert time in seconds to HH:MM:SS format.
  def seconds_to_str(total_seconds)
    return '--:--:--' unless total_seconds

    days, hours, minutes, seconds = fetch_time_details(total_seconds)

    format("%2d #{t('time.day')} %02d:%02d:%02d", days, hours, minutes, seconds)
  end

  def calculate_time_interval(from, optional_to)
    return nil unless optional_to

    optional_to.to_i - from.to_i
  end
end
