# Helpers for formatting objects/values on the application.
module ApplicationFormattersHelper
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

  # A helper for generating css class, return the time bounded status of the item
  #
  # @param [ActiveRecord::Base] item The ActiveRecord objects who has the time_bounded fields
  # @return [String] the string which indicates its current status
  def time_period_class(item)
    return 'not-yet-valid' if item.not_yet_valid?
    return 'currently-valid' if item.currently_valid?
    'expired' if item.expired?
  end
end
