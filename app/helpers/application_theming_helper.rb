# frozen_string_literal: true
module ApplicationThemingHelper
  def application_resources
    # Used to include external javascript/css files, Currently it's empty
  end

  # TODO: Remove this once fully SPA
  def page_class
    return nil if content_for?(:page_class_specified)

    page_class = super
    content_for(:page_class_specified) { page_class }
    @page_class = page_class
  end

  # TODO: Remove this once fully SPA
  def rails_page?
    class_identifier = page_class.split.first

    [
      'high-voltage-pages',
      'user-sessions',
      'user-registrations',
      'devise-passwords',
      'devise-confirmations'
    ].include? class_identifier
  end
end
