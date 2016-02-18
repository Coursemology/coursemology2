# frozen_string_literal: true
module ApplicationThemingHelper
  def application_resources
    include_jquery
  end

  def page_class
    return nil if content_for?(:page_class_specified)

    page_class = super
    content_for(:page_class_specified) { page_class }
    page_class
  end
end
