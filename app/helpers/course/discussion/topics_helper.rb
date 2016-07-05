# frozen_string_literal: true
module Course::Discussion::TopicsHelper
  include Course::Discussion::CodeDisplayHelper

  # Sanitize the title in settings.
  #
  # @return [String|nil] The formatted title.
  def topics_title
    # We don't want to return a blank string so this check is necessary.
    @settings.title ? format_inline_text(@settings.title) : nil
  end
end
