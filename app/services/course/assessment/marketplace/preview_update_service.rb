# frozen_string_literal: true
# Reuses the platform submission update path (answer saves, workflow transitions via the param-style
# event writers) for a marketplace preview Attempt. Overrides ONLY the submission-params reader: the
# parent permits points_awarded/draft_points_awarded, and the grader UI sends draft_points_awarded on
# mark/publish — an EXP column an Attempt does not have. Dropping the param here lets the same frontend
# payload drive both attempt kinds.
class Course::Assessment::Marketplace::PreviewUpdateService < Course::Assessment::Submission::UpdateService
  protected

  def update_submission_params
    params.require(:submission).permit(*workflow_state_params)
  end
end
