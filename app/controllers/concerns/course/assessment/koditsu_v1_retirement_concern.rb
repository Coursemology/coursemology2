# frozen_string_literal: true
# Answers the requests that a course linked to Koditsu v1 can no longer serve (see Course#koditsu_v1_linked?) with
# 410 Gone, so that anyone reporting one can be traced back to the retirement rather than to a missing permission.
#
# Requests refused by the Koditsu v1 rules in Course::Assessment::AssessmentAbility are recognised here and answered
# with 410 instead of the usual 403; actions that refuse on their own call #render_koditsu_v1_retired.
module Course::Assessment::KoditsuV1RetirementConcern
  extend ActiveSupport::Concern

  KODITSU_V1_RETIRED_MESSAGE = 'Koditsu v1 has been retired for this course.'

  protected

  def render_koditsu_v1_retired
    render json: { errors: KODITSU_V1_RETIRED_MESSAGE }, status: :gone
  end

  private

  def handle_access_denied(exception)
    return super if current_course_user&.suspended_from_course?(current_ability)
    return super unless koditsu_v1_retired_denial?(exception)

    render_koditsu_v1_retired
  end

  # Whether the denial is one the Koditsu v1 rules make: the actions they revoke, from those they revoke them from,
  # on a Koditsu assessment or on a submission or answer of one, in a v1-linked course. Other denials keep their
  # 403, such as a teaching assistant force-submitting, or a student editing an answer of a finalised submission.
  def koditsu_v1_retired_denial?(exception)
    return false unless current_course&.koditsu_v1_linked?

    koditsu_v1_revoked_assessment(exception.subject, exception.action)&.is_koditsu_enabled || false
  end

  def koditsu_v1_revoked_assessment(subject, action)
    case subject
    when Course::Assessment
      subject if action == :force_submit_assessment_submission && koditsu_v1_force_submit_holder?
    when Course::Assessment::Submission
      subject.assessment if koditsu_v1_student? && (action == :create || (action == :update && subject.attempting?))
    when Course::Assessment::Answer
      submission = subject.submission
      submission.assessment if koditsu_v1_student? && [:update, :submit_answer].include?(action) &&
                               submission.attempting?
    end
  end

  def koditsu_v1_student?
    current_course_user&.student? || false
  end

  # Those whom the force-submit grant would otherwise reach: the course's managers and owners, and administrators,
  # who need not be enrolled.
  def koditsu_v1_force_submit_holder?
    current_user&.administrator? || current_instance_user&.administrator? ||
      current_course_user&.manager_or_owner? || false
  end
end
