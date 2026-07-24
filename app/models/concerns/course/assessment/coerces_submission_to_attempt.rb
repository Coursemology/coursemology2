# frozen_string_literal: true
# Lets a caller assign a `Course::Assessment::Submission` (the extension) to a `submission`
# association whose real target is the `Course::Assessment::Attempt` base. The `belongs_to` writer
# strictly checks `record.is_a?(reflection.klass)`, so a `Submission` would otherwise raise
# `ActiveRecord::AssociationTypeMismatch`. Coerce it to its `Attempt` so every caller works
# unchanged. Shared verbatim by Answer, SubmissionQuestion, and QuestionBundleAssignment.
module Course::Assessment::CoercesSubmissionToAttempt
  extend ActiveSupport::Concern

  def submission=(value)
    value = value.attempt if value.is_a?(Course::Assessment::Submission)
    super
  end
end
