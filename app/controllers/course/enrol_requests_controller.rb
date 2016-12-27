# frozen_string_literal: true
class Course::EnrolRequestsController < Course::ComponentController
  load_and_authorize_resource :enrol_request, through: :course, class: Course::EnrolRequest.name

  # Allow users to withdraw their requests to register for a course that are pending
  # approval/rejection.
  def destroy
    if @enrol_request.destroy
      redirect_back fallback_location: course_path(current_course), success: t('.success')
    else
      redirect_back fallback_location: course_path(current_course),
                    danger: @enrol_request.errors.full_messages.to_sentence
    end
  end

  private

  def skip_participation_check?
    return true if ['destroy'].include? action_name
  end
end
