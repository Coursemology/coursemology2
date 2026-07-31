# frozen_string_literal: true
# Lets a marketplace previewer self-service reset THEIR OWN submission for an assessment inside the
# "Marketplace Preview Sandbox" container course, so they can relaunch "Try it hands-on" for a
# genuinely fresh attempt (Course::Assessment::Marketplace::PreviewLaunchService otherwise resumes
# an existing submission rather than resetting it).
#
# The container course is shared by every previewer (see PreviewContainerService), and every
# previewer is enrolled as `manager` — the lowest role that can attempt+grade+publish. Under
# Course::Assessment::AssessmentAbility#allow_manager_delete_assessment_submissions, a manager holds
# `:delete_submission` on ANY submission in the course, not just their own, so
# Course::AssessmentMarketplaceAbilityComponent revokes that verb wholesale inside a preview course
# and grants a distinct, `creator_id`-scoped `:reset_own_preview_submission` instead. This endpoint
# also never accepts a submission id from the client: the submission to reset is always looked
# up by (assessment, creator: current_user) — the same lookup
# Course::Assessment::Submission::SubmissionsController#create uses to decide "resume, don't
# reset" — which makes resetting another previewer's submission structurally impossible
# regardless of what a client sends, even before the ability check runs.
#
# This is `update`, not `destroy`: the submission row is kept (same id) so the previewer stays on
# the same submission edit page and sees it come back blank, rather than being redirected away.
# See Course::Assessment::Submission#reset_preview! for the clear-and-reset logic.
class Course::Assessment::Marketplace::PreviewSubmissionsController < Course::Assessment::Marketplace::Controller
  before_action :ensure_preview_course!
  before_action :load_assessment

  def update
    submission = @assessment.submissions.find_by(creator: current_user)
    return head :not_found unless submission

    authorize!(:reset_own_preview_submission, submission)
    submission.reset_preview!
    head :no_content
  end

  protected

  # The one action written for previewers, and the only one they can reach that is not also an
  # ordinary course action. The submission id never comes from the client (see above), so nothing here
  # needs vetting beyond `ensure_preview_course!`.
  def preview_sandbox_accessible?
    true
  end

  private

  # This self-service shortcut only ever exists inside the preview sandbox. A real course's
  # teaching staff already have a vetted removal flow
  # (Course::Assessment::Submission::SubmissionsController#delete/#delete_all); this action
  # deliberately skips that flow's randomization/monitoring bookkeeping, since preview assessments
  # are plain content-frozen copies with neither feature configured.
  def ensure_preview_course!
    raise CanCan::AccessDenied unless current_course.preview?
  end

  def load_assessment
    @assessment = current_course.assessments.find(params[:assessment_id])
  end
end
