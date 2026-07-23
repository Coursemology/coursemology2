# frozen_string_literal: true
# Reuses the platform submission update path (answer saves via UpdateAnswerConcern, workflow
# transitions via the param-style event writers) for a PreviewAttempt. Overrides ONLY the
# submission-params reader: the parent permits points_awarded/draft_points_awarded
# (update_service.rb:68-70) and the grader UI sends draft_points_awarded on mark/publish
# (actions/index.js:188,237) — an EXP column PreviewAttempt does not have. Dropping the param
# here lets the same FE payload drive both attempt kinds.
class Course::Assessment::PreviewAttempt::UpdateService < Course::Assessment::Submission::UpdateService
  protected

  def update_submission_params
    params.require(:submission).permit(*workflow_state_params)
  end
end
