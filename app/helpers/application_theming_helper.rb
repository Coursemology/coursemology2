module ApplicationThemingHelper
  def application_resources
    stylesheet = stylesheet_link_tag 'application', media: 'all', 'data-turbolinks-track' => true
    jquery = include_jquery
    scripts = javascript_include_tag 'application', defer: true, 'data-turbolinks-track' => true

    "#{stylesheet}\n#{jquery}\n#{scripts}\n".html_safe
  end
end
