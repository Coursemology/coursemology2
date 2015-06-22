class Course::UserRegistrationService
  # Registers the specified registration.
  #
  # @param [Course::Registration] registration The registration object to be processed.
  # @return [bool] True if the registration succeeded. False if the registration failed.
  def register(registration)
    if registration.code.empty?
      register_course_user(registration)
    else
      claim_registration_code(registration)
    end
  end

  private

  # Registers the given +user+ for a +course+. This sets the user to the +requested+ state.
  #
  # @param [Course::Registration] registration The registration model containing the course user
  #   parameters.
  # @return [bool] True if the creation succeeded.
  def register_course_user(registration)
    course_user = CourseUser.new(course: registration.course, user: registration.user)
    registration.course_user = course_user
    course_user.save
  end

  def claim_registration_code(registration)
  end
end
