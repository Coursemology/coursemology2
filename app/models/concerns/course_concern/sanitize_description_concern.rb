# frozen_string_literal: true
#
# This concern helps sanitize items with description fields, in case a malicious user bypasses
# the sanitization provided by the WYSIWYG editor.
module CourseConcern::SanitizeDescriptionConcern
  extend ActiveSupport::Concern

  included do
    before_save :sanitize_description
  end

  private

  def sanitize_description
    self.description = ApplicationController.helpers.sanitize_ckeditor_rich_text(description)
  end
end
