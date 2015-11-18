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
    format_html(simple_format(text, {}, sanitize: false))
  end

  # Formats the given user-input string. The string is assumed not to contain HTML markup.
  #
  # @param [String] text The text to display.
  # @return [String]
  def format_inline_text(text)
    format_html(html_escape(text))
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
    user.name # TODO: Implement displaying the actual user avatar.
    content_tag(:span, class: ['image']) do
      image_tag('user_silhouette.svg')
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

  # Format the given datetime
  #
  # @param [DateTime] date The datetime to be formatted
  # @return [String] the formatted datetime string
  def format_datetime(date, format = :long)
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
    else # Not started, not ended.
      ['currently-active']
    end
  end

  # A helper for retrieving the title for a time-bounded item's status.
  #
  # @param [ActiveRecord::Base] item An ActiveRecord object which has time-bounded fields.
  # @return [String|nil] A translated string representing the status of the item, or nil if the
  #   item is valid.
  def time_period_message(item)
    if !item.started?
      t('common.not_started')
    elsif item.ended?
      t('common.ended')
    end
  end

  # A helper for generating CSS classes, based on the draft status of the item.
  #
  # @param [ActiveRecord::Base] item An ActiveRecord object which has a draft field.
  # @return [Array<String>] An array of CSS classes applicable for the provided item.
  def draft_class(item)
    if item.draft?
      ['draft']
    else
      []
    end
  end

  # A helper for retrieving the title of a draft item's status.
  #
  # @param [ActiveRecord::Base] item An ActiveRecord object which has a draft field.
  # @return [String|nil] A translated string representing the status of the item, or nil if the
  #   item is not a draft.
  def draft_message(item)
    t('common.draft') if item.draft?
  end
end
