# :nodoc:
module ApplicationHelper
  include ApplicationThemingHelper
  include ApplicationAnnouncementsHelper
  include ApplicationWidgetsHelper

  # Checks if the current page has a sidebar.
  #
  # @return [Bool] True if there is a sidebar for the current page.
  def has_sidebar?
    content_for?(:layout_sidebar)
  end

  # Sets the current page to have a sidebar.
  #
  # The view must still render the sidebar in its content area.
  def sidebar!
    content_for(:layout_sidebar) do
      'true'
    end
  end

  # Defines the sidebar for the current page.
  #
  # @param [Array<String>] classes An array of classes to apply to the sidebar container.
  # @return [String] The buffer containing the markup for the sidebar.
  def sidebar(classes: ['col-xs-7', 'col-sm-3', 'col-md-2'])
    sidebar!

    render layout: 'layouts/sidebar', locals: { sidebar_classes: classes } do
      yield
    end
  end

  # Formats the given User as a user-visible string.
  #
  # @param [User] user The User to display.
  # @return [String] The user-visible string to represent the User, suitable for rendering as
  #   output.
  def display_user(user)
    user.name
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
    return 'expired' if item.expired?
  end
end
