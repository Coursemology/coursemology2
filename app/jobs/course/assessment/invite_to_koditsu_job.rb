# frozen_string_literal: true
class Course::Assessment::InviteToKoditsuJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers
  include Course::Assessment::KoditsuAssessmentInvitationConcern

  protected

  def perform_tracked(assessment_id, updated_at)
    assessment = Course::Assessment.find_by(id: assessment_id)

    is_koditsu = assessment.is_koditsu_enabled && assessment.koditsu_assessment_id
    return unless is_koditsu && assessment.updated_at == updated_at

    instance = Course.unscoped { assessment.course.instance }

    ActsAsTenant.with_tenant(instance) do
      send_invitation_for_koditsu_assessment(assessment)
    end
  end
end
