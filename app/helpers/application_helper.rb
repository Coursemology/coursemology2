# :nodoc:
module ApplicationHelper
  include ApplicationThemingHelper

  # Checks if the current page has a sidebar.
  #
  # @return [Bool] True if there is a sidebar for the current page.
  def has_sidebar?
    content_for?(:layout_sidebar)
  end

  # Sets the current page to have a sidebar.
  #
  # The view must still render the sidebar in its content area.
  def has_sidebar
    content_for(:layout_sidebar) do
      'true'
    end
  end

  # Defines the sidebar for the current page.
  #
  # @param classes [Array<String>] An array of classes to apply to the sidebar container.
  # @return String The buffer containing the markup for the sidebar.
  def sidebar(classes: ['col-xs-7', 'col-sm-3', 'col-md-2'])
    has_sidebar

    render layout: 'layouts/sidebar', locals: { sidebar_classes: classes } do
      yield
    end
  end

  # Formats the given User as a user-visible string.
  #
  # @param user [User] The User to display.
  # @return [String] The user-visible string to represent the User, suitable for rendering as
  #                  output.
  def display_user(user)
    user.name
  end

  # Links to the given User.
  #
  # @param user [User] The User to display.
  # @yield The user will be yielded to the provided block, and the block can override the display
  #        of the User.
  # @yieldparam user [User] The user to display.
  # @return [String] The user-visible string, including embedded HTML which will display the
  #                  string within a link to bring to the User page.
  def link_to_user(user)
    link_path = '' # TODO: Link to the user page.
    link_to(link_path) do
      if block_given?
        yield(user)
      else
        display_user(user)
      end
    end
  end

  # Format the given datetime
  #
  # @param date [DateTime] The datetime to be formatted
  # @return [String] the formatted datetime string
  def format_datetime(date, format = :long)
    date.to_formatted_s(format)
  end

  # Get the course user of the signed in user.
  #
  # @return [CourseUser] the course_user instance of the signed in user if a
  #         course instance variable is defined.
  def current_course_user
    if current_user and @course
      @current_course_user ||= CourseUser.find_by_user_id_and_course_id(
        current_user.id,
        @course.id
      )
    end
    @current_course_user
  end
end
