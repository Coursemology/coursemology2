# frozen_string_literal: true
class Course::UserInvitationService; end
module Course::UserInvitationService::RegistrationCodeConcern
  extend ActiveSupport::Autoload

  # Enables or disables registration codes in the given course.
  #
  # @param [Boolean] enable True if registration codes should be enabled.
  # @return [Boolean]
  def enable_registration_code(enable)
    if enable
      return true if @current_course.registration_key
      generate_registration_key
    else
      @current_course.registration_key = nil
    end
    @current_course.save
  end

  private

  # Generates a registration key for the course.
  #
  # @return [void]
  def generate_registration_key
    @current_course.generate_registration_key
  end
end
