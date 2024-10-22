# frozen_string_literal: true
module Course::Assessment::KoditsuAssessmentInvitationConcern
  extend ActiveSupport::Concern

  def send_invitation_for_koditsu_assessment(assessment)
    invitation_validity_period = {
      startAt: assessment.start_at - 12.hours,
      endAt: assessment.end_at
    }

    course_users = assessment.course.course_users.preload(user: :emails)
    users = course_users.map { |cu| [cu, cu.user] }

    invitation_service = Course::Assessment::KoditsuAssessmentInvitationService.
                         new(assessment, users, invitation_validity_period)
    status, response = invitation_service.run_invite_users_to_koditsu_assessment

    [status, response]
  end

  def all_invitation_successful?(invitation_response)
    failure_count = invitation_response.filter do |invitation|
      invitation['status'] == 'errorOther'
    end.length

    failure_count == 0
  end
end
