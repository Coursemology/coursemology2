# frozen_string_literal: true
# Helpers for formatting objects/values on the application.
module ApplicationFormattersHelper
  include ApplicationHTMLFormattersHelper

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
  # @return [String] A url for the image.
  def user_image(user)
    image_path(user.profile_photo.medium.url) if user&.profile_photo&.medium&.url
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
end
