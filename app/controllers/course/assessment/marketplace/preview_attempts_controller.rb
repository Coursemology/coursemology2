# frozen_string_literal: true
class Course::Assessment::Marketplace::PreviewAttemptsController < Course::Assessment::Marketplace::Controller
  include Course::Assessment::Submission::SubmissionsControllerServiceConcern

  before_action :load_listing, only: [:create]
  before_action :load_attempt, only: [:edit, :update, :auto_grade]
  before_action :authorize_attempt!
  # Questions may be added to the source assessment after an attempt already exists; without this,
  # newly added questions have no submission_question row and `_questions.json.jbuilder` (T7, reused
  # verbatim) raises rendering `edit` — mirrors submissions_controller.rb:21,30. auto_grade also
  # renders 'edit' directly, so it needs the same guard.
  before_action :load_or_create_submission_questions, only: [:edit, :update, :auto_grade]

  # Defines #update: service.update → answer saves + workflow transitions + `render 'edit'`
  # (which resolves to THIS controller's preview edit template, T7). @assessment/@submission are
  # snapshot at service memoization (concern:18), hence set in load_attempt, never in actions.
  delegate_to_service(:update)
  delegate_to_service(:load_or_create_submission_questions)

  def create
    attempt = existing_attempt || build_attempt
    attempt.create_new_answers
    render json: { id: attempt.id, assessmentId: attempt.assessment_id }
  end

  def edit
    # implicit render of preview_attempts/edit.json.jbuilder (T7)
  end

  def auto_grade
    Course::Assessment::PreviewAttempt::AutoGradingService.grade(@attempt)
    @attempt.reload
    render 'edit'
  end

  # The action delegated by delegate_to_service cannot authorize inline — gate everything here.
  MEMBER_ACTION_ABILITIES = { 'edit' => :read, 'update' => :update, 'auto_grade' => :grade }.freeze

  private

  def authorize_attempt!
    if action_name == 'create'
      authorize! :create, Course::Assessment::PreviewAttempt
    else
      authorize! MEMBER_ACTION_ABILITIES.fetch(action_name), @attempt
    end
  end

  # Swap the platform UpdateService for the preview subclass (concern reads this).
  def service_class
    Course::Assessment::PreviewAttempt::UpdateService
  end

  def load_listing
    @listing = Course::Assessment::Marketplace::Listing.find(params[:listing_id])
  end

  def source_assessment
    @source_assessment ||= @listing.assessment
  end

  def existing_attempt
    Course::Assessment::PreviewAttempt.find_by(assessment: source_assessment, creator: current_user)
  end

  def build_attempt
    User.with_stamper(current_user) do
      Course::Assessment::PreviewAttempt.create!(
        assessment: source_assessment, creator: current_user, updater: current_user
      )
    end
  end

  # Member routes are shallow (no listing_id): the attempt resolves its own assessment.
  def load_attempt
    @attempt = Course::Assessment::PreviewAttempt.find(params[:id])
    @submission = @attempt
    @assessment = @attempt.assessment
  end
end
