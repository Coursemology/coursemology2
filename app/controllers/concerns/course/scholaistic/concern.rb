# frozen_string_literal: true
module Course::Scholaistic::Concern
  extend ActiveSupport::Concern

  include Course::UsersHelper

  private

  def scholaistic_course_linked?
    current_course.component_enabled?(Course::ScholaisticComponent) &&
      current_course.settings(:course_scholaistic_component)&.integration_key.present?
  end

  def can_attempt_scholaistic_assessment?(assessment)
    can?(:attempt, assessment) &&
      (can?(:manage, assessment) ||
      (assessment.start_at <= Time.zone.now && assessment.published?))
  end

  def sync_all_scholaistic_submissions!
    result = ScholaisticApiService.all_submissions!(current_course)

    assessments_hash, remaining_upstream_submission_ids = build_assessments_hash_and_submission_ids_set

    submissions_to_save = []
    submission_ids_to_destroy = []

    result.each do |data|
      remaining_upstream_submission_ids.delete(data[:upstream_id])

      creator_id = primary_email_to_user_id[data[:creator_email]]
      next unless creator_id # user exists upstream but not locally

      assessment_hash = assessments_hash[data[:upstream_assessment_id]]
      next unless assessment_hash # assessment not synced

      assessment = assessment_hash[:assessment]
      existing_submission = assessment_hash[:creator_id_to_submission]&.[](creator_id)

      if data[:status] != :graded
        submission_ids_to_destroy << data[:upstream_id] if existing_submission.present?

        next
      end

      submission = existing_submission || assessment.submissions.build(creator_id: creator_id)

      submission.upstream_id = data[:upstream_id]
      submission.course_user = user_id_to_course_user[creator_id]
      submission.points_awarded = (assessment.base_exp * data[:grade]).round
      submission.reason = assessment.title

      next unless submission.changed?

      if submission.points_awarded_changed?
        submission.awarded_at = Time.zone.now
        submission.awarder = User.system
      end

      submissions_to_save << submission
    end

    remaining_upstream_submission_ids.each do |upstream_submission_id|
      submission_ids_to_destroy << upstream_submission_id
    end

    return if submissions_to_save.empty? && submission_ids_to_destroy.empty?

    # TODO: The SQL queries will scale proportionally with `result.size`,
    # but we won't always have to sync all submissions since there's `last_synced_at`.
    ActiveRecord::Base.transaction do
      if submission_ids_to_destroy.any? &&
         !Course::ScholaisticSubmission.where(upstream_id: submission_ids_to_destroy).destroy_all
        raise ActiveRecord::Rollback
      end

      submissions_to_save.each(&:save!)
    end
  end

  def primary_email_to_user_id
    @primary_email_to_user_id ||=
      current_course.users.includes(:emails).where(emails: { primary: true }).select(:id, :email).to_h do |user|
        [user.primary_email_record.email, user.id]
      end
  end

  def build_assessments_hash_and_submission_ids_set
    assessments_hash = {}
    upstream_submission_ids_set = Set.new

    current_course.scholaistic_assessments.includes(:submissions).each do |assessment|
      creator_id_to_submission = {}

      assessment.submissions.each do |submission|
        creator_id_to_submission[submission.creator_id] = submission
        upstream_submission_ids_set.add(submission.upstream_id)
      end

      assessments_hash[assessment.upstream_id] =
        {
          assessment: assessment,
          creator_id_to_submission: creator_id_to_submission
        }
    end

    [assessments_hash, upstream_submission_ids_set]
  end

  def user_id_to_course_user
    @user_id_to_course_user ||= preload_course_users_hash(current_course)
  end
end
