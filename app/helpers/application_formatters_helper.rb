# frozen_string_literal: true
# Helpers for formatting objects/values on the application.
module ApplicationFormattersHelper
  include ApplicationHTMLFormattersHelper

  # Formats the given user-input string. The string is assumed not to contain HTML markup, and
  # will be processed for simple formatting like newlines using the Rails +simple_format+ helper.
  #
  # This will treat the given text as a block element.
  #
  # @param [String] text The text to display.
  # @return [String]
  def format_block_text(text)
    simple_format(html_escape(text), {}, sanitize: false)
  end

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
    user.name
  end

  # Displays the given user's image.
  #
  # @param [User] user The user to display
  # @return [String] A HTML fragment containing the image to display for the user.
  def display_user_image(user)
    content_tag(:span, class: ['image']) do
      if user.nil? || user.profile_photo.medium.url.nil?
        image_tag('user_silhouette.svg')
      else
        image_tag(user.profile_photo.medium.url)
      end
    end
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
    link_path = '' # TODO: Link to the user page.
    link_to(link_path, options) do
      if block_given?
        yield(user)
      else
        display_user(user)
      end
    end
  end

  # Renders the given topic.
  #
  # @param [Course::Discussion::Topic] topic The topic to display.
  # @option options [String] :post_partial The path to the post partial
  # @option options [Hash] :post_locals The locals to be passed to the post partial
  # @option options [String] :footer The path to the footer partial, this is normally used for add a
  #   reply form below all the posts.
  # @option options [Boolean] :read_marks Set to true to eager load read marks for posts.
  # @option options [Boolean] :with_votes Set to true to display votes.
  def display_topic(topic, options = {})
    render partial: 'course/discussion/topic',
           object: topic,
           locals: options
  end

  # Custom datetime formats
  Time::DATE_FORMATS[:date_only_long] = '%B %d, %Y'
  Time::DATE_FORMATS[:date_only_short] = '%d %b'

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
  def format_datetime(date, format = :long)
    user_zone = (current_user ? current_user.time_zone : nil) ||
                Application.config.x.default_user_time_zone
    # TODO: Fix the query. This is a workaround to display the time in the correct zone, there are
    # places where datetimes are directly fetched from db and skipped AR, which result in incorrect
    # time zone.
    date = date.in_time_zone(user_zone) if date.zone != user_zone

    date.to_formatted_s(format)
  end

  # A helper for generating CSS classes, based on the time-bounded status of the item.
  #
  # @param [ActiveRecord::Base] item An ActiveRecord object which has time-bounded fields.
  # @return [Array<String>] An array of CSS classes applicable for the provided item.
  def time_period_class(item)
    if !item.started?
      ['not-started']
    elsif item.ended?
      ['ended']
    else # Started, but not yet ended.
      ['currently-active']
    end
  end

  # A helper for retrieving the title for a time-bounded item's status.
  #
  # @param [ActiveRecord::Base] item An ActiveRecord object which has time-bounded fields.
  # @return [String] A translated string representing the status of the item.
  # @return [nil] If the item is valid.
  def time_period_message(item)
    if !item.started?
      t('common.not_started')
    elsif item.ended?
      t('common.ended')
    end
  end

  # A helper for generating CSS classes, based on the published status of the item.
  #
  # @param [ActiveRecord::Base] item An ActiveRecord object which has a draft field.
  # @return [Array<String>] An array of CSS classes applicable for the provided item.
  def draft_class(item)
    if item.published?
      []
    else
      ['draft']
    end
  end

  # A helper for retrieving the title of a published item's status.
  #
  # @param [ActiveRecord::Base] item An ActiveRecord object which has a published field.
  # @return [String] A translated string representing the status of the item.
  # @return [nil] If the item is published.
  def draft_message(item)
    t('common.draft') unless item.published?
  end

  # A helper for generating CSS classes, based on the unread status of the item.
  #
  # @param [ActiveRecord::Base] item An ActiveRecord object which acts as readable.
  # @return [Array<String>] An array of CSS classes applicable for the provided item.
  def unread_class(item)
    if item.unread?(current_user)
      ['unread']
    else
      []
    end
  end
end
