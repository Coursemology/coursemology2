# frozen_string_literal: true
class Course::Assessment::KoditsuAssessmentInvitationService
  def initialize(assessment, users, validity)
    @assessment = assessment
    @users = users
    @validity = validity

    all_users = @users.map do |course_user, user|
      is_admin = (course_user.role == 'manager' || course_user.role == 'owner')

      {
        name: user.name,
        email: user.email,
        role: is_admin ? 'admin' : 'candidate'
      }
    end

    @invitation_object = {
      validity: @validity,
      users: all_users
    }
  end

  def run_invite_users_to_koditsu_assessment
    id = @assessment.koditsu_assessment_id

    koditsu_api_service = KoditsuAsyncApiService.new("api/assessment/#{id}/invite", @invitation_object)
    response_status, response_body = koditsu_api_service.post

    if [201, 207].include?(response_status)
      [response_status, response_body['data']]
    else
      [response_status, nil]
    end
  end
end
