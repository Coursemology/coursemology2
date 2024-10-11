# frozen_string_literal: true
class Course::Assessment::Submission::FetchSubmissionsFromKoditsuJob <
  ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers
  include Course::Assessment::Submission::Koditsu::SubmissionsConcern

  protected

  def perform_tracked(assessment_id, updated_at, user)
    assessment = Course::Assessment.find_by(id: assessment_id)

    is_koditsu = assessment.is_koditsu_enabled && assessment.koditsu_assessment_id
    return unless is_koditsu && Time.zone.at(assessment.updated_at) == Time.zone.at(updated_at)

    instance = Course.unscoped { assessment.course.instance }

    ActsAsTenant.with_tenant(instance) do
      fetch_all_submissions_from_koditsu(assessment, user)
    end
  end
end
