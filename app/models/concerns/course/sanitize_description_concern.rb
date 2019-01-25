# frozen_string_literal: true
#
# This concern helps sanitize items with description fields, in case a malicious user bypasses
# the sanitization provided by the WYSIWHG editor.
module Course::SanitizeDescriptionConcern
  extend ActiveSupport::Concern

  included do
    before_save :sanitize_description
  end

  private

  def sanitize_description
    self.description = ApplicationController.helpers.format_html(description)
  end
end
