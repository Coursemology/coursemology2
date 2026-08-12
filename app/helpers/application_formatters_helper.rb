# frozen_string_literal: true
require 'htmlentities'

# Helpers for formatting objects/values on the application.
module ApplicationFormattersHelper
  include ApplicationHtmlFormattersHelper

  # Formats the given user-input string. The string is assumed not to contain HTML markup.
  #
  # @param [String] text The text to display.
  # @return [String]
  def format_inline_text(text)
    html_escape(text)
  end

  # Formats the given User as a user-visible string.
  #
  # @param [User] user The User to display.
  # @return [String] The user-visible string to represent the User, suitable for rendering as
  #   output.
  def display_user(user)
    user&.name
  end

  # Return the given user's image url.
  #
  # @param [User] user The user to display
  # @param [Boolean] url Whether to return a URL or path
  # @return [String] A url for the image.
  def user_image(user, url: false)
    send("image_#{url ? 'url' : 'path'}", user.profile_photo.medium.url) if user&.profile_photo&.medium&.url
  end

  # Links to the given User.
  #
  # @param [User] user The User to display.
  # @param [Hash] options The options to pass to +link_to+
  # @yield The user will be yielded to the provided block, and the block can override the display
  #   of the User.
  # @yieldparam [User] user The user to display.
  # @return [String] The user-visible string, including embedded HTML which will display the
  #   string within a link to bring to the User page.
  def link_to_user(user, options = {})
    link_path = user_path(user)
    link_to(link_path, options) do
      if block_given?
        yield(user)
      else
        display_user(user)
      end
    end
  end

  # Custom datetime formats
  Time::DATE_FORMATS[:date_only_long] = '%B %d, %Y'
  Time::DATE_FORMATS[:date_only_short] = '%d %b'
  Time::DATE_FORMATS[:i18n_default] = I18n.t('time.formats.default')

  # Format the given datetime
  #
  # @param [DateTime] date The datetime to be formatted
  # @param [Symbol] format The output format. Use Ruby's defaults or see above for
  #   some predefined formats.
  #   e.g. :long => "December 04, 2007 00:00"
  #        :short => "04 Dec 00:00"
  #        :date_only_long => "December 04, 2007"
  #        :date_only_short => "04 Dec"
  # @return [String] the formatted datetime string
  def format_datetime(date, format = :long, user: nil)
    user ||= respond_to?(:current_user) ? current_user : nil
    user_zone = user&.time_zone || Application.config.x.default_user_time_zone
    # TODO: Fix the query. This is a workaround to display the time in the correct zone, there are
    # places where datetimes are directly fetched from db and skipped AR, which result in incorrect
    # time zone.
    date = date.in_time_zone(user_zone) if date.zone != user_zone

    date.to_formatted_s(format)
  end

  # @return the duration in the format of "HH:MM:SS", eg 04H05M11S
  def format_duration(total_seconds)
    seconds = total_seconds % 60
    minutes = (total_seconds / 60) % 60
    hours = total_seconds / (60 * 60)
    format('%<hours>02dH%<minutes>02dM%<seconds>02dS', hours: hours, minutes: minutes, seconds: seconds)
  end

  # Tags that survive +clean_html_text+ instead of being stripped.
  #
  # These elements are empty or void: everything they contribute lives in their attributes
  # (an uploaded image's +src+, an embedded video's +url+), so stripping them discards content
  # rather than merely dropping formatting. Presentational tags remain stripped, since the text
  # they wrap is kept.
  #
  # See ApplicationHtmlFormattersHelper::SANITIZATION_FILTER_WHITELIST for what may actually
  # reach the database: <oembed> is what CKEditor's media embed writes, while <iframe> only
  # appears in rich text saved by older editors.
  CLEAN_HTML_TEXT_ALLOWED_TAGS = ['img', 'oembed', 'iframe', 'embed', 'audio', 'video', 'source'].freeze

  # Attributes kept on CLEAN_HTML_TEXT_ALLOWED_TAGS. Only those identifying or describing the
  # embedded resource are retained; sizing and styling attributes are formatting, so they go.
  CLEAN_HTML_TEXT_ALLOWED_ATTRIBUTES = ['src', 'srcset', 'url', 'alt', 'title'].freeze

  # Tags that end a visual line, and so become a newline in the plain text output. CKEditor emits
  # bare <br>, but rich text saved by older editors uses <br /> and <br/>.
  CLEAN_HTML_TEXT_LINE_BREAK_TAGS = /<br\s*\/?>|<\/(?:p|figure)>/i

  # Splits sanitized HTML into tags and the text between them, so that entities are only decoded in
  # the latter. Matching up to the first '>' is not enough: the HTML5 serializer escapes '&', '"' and
  # non-breaking spaces in attribute values but leaves '<' and '>' alone, so an image whose alt text
  # reads 'a > b' would otherwise be cut in half and the attributes after the cut wrongly decoded.
  # Quoted values are therefore skipped over, which is safe as the serializer always double-quotes
  # attributes and escapes any '"' within them.
  CLEAN_HTML_TEXT_TAGS = /(<[^>"]*(?:"[^"]*"[^>"]*)*>)/

  # Formats rich text fields for CSV export by stripping HTML tags and decoding HTML entities.
  # Rich text fields are saved as HTML in the database (from WYSIWYG editors), so this helper
  # converts them to plain text suitable for CSV files by removing HTML markup and decoding
  # entities like &nbsp;, &amp;, etc.
  #
  # Tags in CLEAN_HTML_TEXT_ALLOWED_TAGS are kept verbatim, as stripping them would drop the
  # content itself and not just its formatting.
  #
  # @param [String] text The rich text (HTML) to format
  # @return [String] Plain text with formatting HTML tags removed and entities decoded
  def clean_html_text(text)
    return '' unless text

    cleaned_text = text.gsub(CLEAN_HTML_TEXT_LINE_BREAK_TAGS) { |tag| "#{tag}\n" }
    sanitized = strip_formatting_html_tags(cleaned_text)

    entities = HTMLEntities.new
    decoded = sanitized.split(CLEAN_HTML_TEXT_TAGS).map do |part|
      part.start_with?('<') ? part : entities.decode(part)
    end.join

    decoded.strip
  end
  alias_method :format_rich_text_for_csv, :clean_html_text

  # Checks if the given HTML text is blank after stripping HTML tags and decoding entities.
  # Useful for checking if rich text fields contain actual content vs just empty HTML markup.
  #
  # @param [String] text The HTML text to check
  # @return [Boolean] true if the text is blank after stripping HTML
  def clean_html_text_blank?(text)
    clean_html_text(text).blank?
  end

  private

  # Strips every HTML tag except CLEAN_HTML_TEXT_ALLOWED_TAGS, keeping the text the stripped tags
  # wrapped. Note that the sanitizer is instantiated per call because it is not thread-safe, and that
  # +sanitize+ cannot be used here: ApplicationHtmlFormattersHelper overrides it with a pipeline
  # that ignores the tag and attribute options.
  #
  # @param [String] text The rich text (HTML) to strip
  # @return [String] Sanitized HTML fragment containing only the allowed tags and allow-listed attributes
  def strip_formatting_html_tags(text)
    sanitizer = Rails::HTML::Sanitizer.best_supported_vendor.safe_list_sanitizer.new
    sanitizer.sanitize(text,
                       tags: CLEAN_HTML_TEXT_ALLOWED_TAGS,
                       attributes: CLEAN_HTML_TEXT_ALLOWED_ATTRIBUTES)
  end
end
