# frozen_string_literal: true
module ApplicationThemingHelper
  def application_resources
    # Used to include external javascript/css files, Currently it's empty
  end

  def page_class
    return nil if content_for?(:page_class_specified)

    page_class = super
    content_for(:page_class_specified) { page_class }
    page_class
  end
end
