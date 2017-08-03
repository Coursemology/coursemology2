# frozen_string_literal: true
module Course::ControllerHelper
  include Course::LessonPlan::TodosHelper

  # Formats the given +CourseUser+ as a user-visible string.
  #
  # @param [CourseUser] user The User to display.
  # @return [String] The user-visible string to represent the User, suitable for rendering as
  #   output.
  def display_course_user(user)
    user.name
  end

  # Formats the given +User+ as a user-visible string. If the current user is a course_user in
  # the course, the course_user.name would be used instead.
  #
  # @param [User|CourseUser] user The User to display.
  # @return [String] The user-visible string to represent the User, suitable for rendering as
  #   output.
  def display_user(user)
    return nil unless user
    return display_course_user(user) if user.is_a?(CourseUser)

    course_user = user.course_users.find_by(course: controller.current_course)
    if course_user
      display_course_user(course_user)
    else
      super(user)
    end
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
    link_text = capture { block_given? ? yield(user) : display_course_user(user) }
    link_path = course_user_path(user.course, user)
    link_to(link_text, link_path, options)
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

  # Display the course_user_badge given the course_user
  #
  # @param [CourseUser] course_user The CourseUser for which the badge is to be displayed
  # @return [String] HTML string to render the course_user_badge
  def display_course_user_badge(course_user)
    render partial: 'layouts/course_user_badge',
           locals: { course_user: course_user }
  end

  # Helper method to display the course logo. If logo is present, returns the medium version
  # of the logo (see ImageUploader for more versions). Otherwise, returns the default course
  # logo.
  #
  # @return [String] HTML string to render the course logo
  def display_course_logo(course)
    content_tag(:span, class: ['image']) do
      image_tag(course.logo.medium.url || 'course_default_logo.svg')
    end
  end
end
