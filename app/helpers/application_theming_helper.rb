# frozen_string_literal: true
module ApplicationThemingHelper
  def application_resources
    jquery = include_jquery
    scripts = javascript_include_tag 'application', defer: true, 'data-turbolinks-track' => true

    "#{jquery}\n#{scripts}\n".html_safe
  end
end
