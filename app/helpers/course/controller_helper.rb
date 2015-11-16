module Course::ControllerHelper
  # Formats the given +CourseUser+ as a user-visible string.
  #
  # @param [CourseUser] user The User to display.
  # @return [String] The user-visible string to represent the User, suitable for rendering as
  #   output.
  def display_course_user(user)
    user.name
  end

  # Links to the given +CourseUser+.
  #
  # @param [CourseUser] user The User to display.
  # @param [Hash] options The options to pass to +link_to+
  # @yield The user will be yielded to the provided block, and the block can override the display
  #   of the User.
  # @yieldparam [User] user The user to display.
  # @return [String] The user-visible string, including embedded HTML which will display the
  #   string within a link to bring to the User page.
  def link_to_course_user(user, options = {})
    link_path = '' # TODO: Link to the user page.
    link_to(link_path, options) do
      if block_given?
        yield(user)
      else
        display_course_user(user)
      end
    end
  end

  # Links to the given User or CourseUser. If a User is given, the CourseUser under
  # current_course of the given user will be displayed.
  #
  # @param [CourseUser|User] user The CourseUser/User to display.
  # @param [Hash] options The options to pass to +link_to+
  # @param [Proc] block The block to use for displaying the user.
  # @return [String] The user-visible string, including embedded HTML which will display the
  #   string within a link to bring to the User page.
  def link_to_user(user, options = {}, &block)
    return link_to_course_user(user, options, &block) if user.is_a?(CourseUser)

    course_user = user.course_users.find_by(course: controller.current_course)
    if course_user
      link_to_course_user(course_user, options, &block)
    else
      super(user, options, &block)
    end
  end
end
