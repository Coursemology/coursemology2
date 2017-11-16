# frozen_string_literal: true
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
  include FormForWithResourceHelper
  include RenderWithinLayoutHelper

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

  # Returns a meta tag that has the server side context. Now the context contains following info:
  # :controller-name The name of the current controller.
  #   e.g. 'Course::LessonPlanController' will return 'course/lesson_plan'
  # :i18n-locale The locale on the server side.
  #
  # @return [String] The html meta tag.
  def server_context_meta_tag
    data = {
      name: 'server-context',
      'data-controller-name': controller.class.name.sub(/Controller$/, '').underscore,
      'data-i18n-locale': I18n.locale,
      'data-time-zone': ActiveSupport::TimeZone::MAPPING[user_time_zone]
    }

    tag(:meta, data)
  end

  def user_time_zone
    user_signed_in? ? current_user.time_zone : nil
  end

  # This helper will includes all webpack assets
  def webpack_assets_tag
    capture do
      concat javascript_pack_tag('manifest')
      concat javascript_pack_tag('lib')
      concat javascript_pack_tag('vendor')
      concat javascript_pack_tag('coursemology')
    end
  end
end
