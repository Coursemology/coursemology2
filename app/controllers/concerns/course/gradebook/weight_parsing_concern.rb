# frozen_string_literal: true
# Parses user-supplied gradebook weights consistently across the gradebook and
# external-assessment controllers. Blank is treated as 0 (the sane default), but
# non-numeric input raises rather than silently coercing to 0 via #to_f — a
# zeroed weight means "this assessment no longer counts", so junk must 422, not
# quietly drop an assessment out of the weighted total.
module Course::Gradebook::WeightParsingConcern
  extend ActiveSupport::Concern

  private

  # Returns a Float; blank -> 0.0. Raises ArgumentError on non-numeric input so
  # callers can surface a 422 (Float() already raises ArgumentError on junk
  # strings; TypeError from non-castable types is normalised to ArgumentError so
  # callers only need to rescue one class).
  def parse_weight(value)
    Float(value.presence || 0)
  rescue TypeError
    raise ArgumentError, "invalid weight: #{value.inspect}"
  end
end
