# :nodoc:
module ApplicationHelper
  include FontAwesome::Rails::IconHelper

  include ApplicationThemingHelper
  include ApplicationAnnouncementsHelper
  include ApplicationWidgetsHelper
  include ApplicationCocoonHelper
  include ApplicationNotificationsHelper

  include ApplicationFormattersHelper
  include ApplicationSidebarHelper
  include RouteOverridesHelper

  # Accesses the header tags specified for the current page
  def header_tags(*args, &proc)
    content_for(:header_tags, *args, &proc)
  end

  # @!method within_head_tag(&proc)
  #   Adds the given block to the header tags which will be added to the rendered page.
  alias_method :within_head_tag, :header_tags

  # Generates a page header. The title shown will be the +.header+ key in the page
  # that calls this helper.
  #
  # @param [String] header The custom page header string.
  # @yield A block in which other helper methods may be called, to place child elements
  #   on the far right of the header.
  # @return [String]
  def page_header(header = nil)
    content_tag(:div, class: 'page-header') do
      content_tag(:h1) do
        content_tag(:span, header || t('.header')) +
          content_tag(:div, class: 'pull-right') do
            yield if block_given?
          end
      end
    end
  end

  # Generates all page titles, from the reverse breadcrumb if it's available,
  # otherwise checks the +content_for?+ Rails helper. Appends the default
  # title to everything.
  # @return [String]
  def page_title
    if content_for?(:page_title)
      "#{content_for(:page_title)} - "
    elsif !breadcrumb_names.empty?
      "#{breadcrumb_names.reverse.join(' - ')} - "
    else
      ''
    end +
      t('layout.coursemology')
  end
end
