# frozen_string_literal: true
module Course::ExperiencePointsRecordsHelper
  # Linked text to be displayed for the "Reason" column in the Experience Points History page.
  #
  # @return [String] The linked text
  def linked_display_reason(record)
    text = format_inline_text(record.reason)
    link_params = record.reason_url_params
    link_params ? link_to(text, link_params) : text
  end
end
