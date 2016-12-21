# frozen_string_literal: true

# Provides a service object for inviting users into a course.
class Course::UserInvitationService
  include EmailInvitationConcern

  # Constructor for the user invitation service object.
  #
  # @param [User] current_user The user performing this action.
  # @param [Course] current_course The course to invite users to.
  def initialize(current_user, current_course)
    @current_user = current_user
    @current_course = current_course
    @current_instance = @current_course.instance
  end
end
