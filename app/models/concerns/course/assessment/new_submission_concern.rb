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
        raise ActiveRecord::Rollback unless qbas.update_all(submission_id: new_submission.id)

        success = true
      end
    else
      success = new_submission.save
    end
    success
  end
end
