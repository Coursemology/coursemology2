# frozen_string_literal: true
module Course::Assessment::NewSubmissionConcern
  extend ActiveSupport::Concern

  def create_new_submission(new_submission, current_user)
    success = false
    if randomization == 'prepared'
      Course::Assessment::Submission.transaction do
        qbas = question_bundle_assignments.where(user: current_user).lock!
        if qbas.empty? # TODO: More thorough validations here
          new_submission.errors.add(:base, :no_bundles_assigned)
          raise ActiveRecord::Rollback
        end
        raise ActiveRecord::Rollback unless new_submission.save
        # `question_bundle_assignments.submission_id` now targets course_assessment_attempts (the
        # FK repoint, Step 2d) — it must hold an Attempt id, not the small Submission table's own
        # (different) id. `attempt_id` is a real, undelegated column already on Submission's own
        # table (the FK to its attempt), so no delegate is needed to read it.
        raise ActiveRecord::Rollback unless qbas.update_all(submission_id: new_submission.attempt_id)

        success = true
      end
    else
      success = new_submission.save
    end
    success
  end
end
