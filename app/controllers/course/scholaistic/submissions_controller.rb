# frozen_string_literal: true
class Course::Scholaistic::SubmissionsController < Course::Scholaistic::Controller
  before_action :load_and_authorize_scholaistic_assessment

  before_action :sync_scholaistic_submission!, only: [:show]

  def index
    @embed_src = ScholaisticApiService.embed!(
      current_course_user,
      ScholaisticApiService.submissions_path(@scholaistic_assessment.upstream_id),
      request.origin
    )
  end

  def show
    result = ScholaisticApiService.submission!(current_course, submission_id)
    head :not_found and return if result[:status] == :not_found

    @creator_name = result[:creator_name]

    @embed_src =
      ScholaisticApiService.embed!(
        current_course_user,
        if can?(:manage_scholaistic_submissions, current_course)
          ScholaisticApiService.manage_submission_path(@scholaistic_assessment.upstream_id, submission_id)
        else
          ScholaisticApiService.submission_path(@scholaistic_assessment.upstream_id, submission_id)
        end,
        request.origin
      )
  end

  def submission
    head :not_found and return unless
      can?(:attempt, @scholaistic_assessment) && @scholaistic_assessment.start_at <= Time.zone.now

    submission_id = ScholaisticApiService.find_or_create_submission!(
      current_course_user,
      @scholaistic_assessment.upstream_id
    )

    render json: { id: submission_id }
  end

  private

  def load_and_authorize_scholaistic_assessment
    @scholaistic_assessment = current_course.scholaistic_assessments.find(params[:assessment_id] || params[:id])
    authorize! :read, @scholaistic_assessment
  end

  def sync_scholaistic_submission!
    result = ScholaisticApiService.submission!(current_course, submission_id)

    if result[:status] != :graded
      @scholaistic_assessment.submissions.where(upstream_id: submission_id).destroy_all

      return
    end

    email = User::Email.find_by(email: result[:creator_email], primary: true)
    creator = email && current_course.users.find(email.user_id)
    submission = creator && @scholaistic_assessment.submissions.find_or_initialize_by(creator_id: creator.id)
    return unless submission

    submission.upstream_id = submission_id
    submission.reason = @scholaistic_assessment.title
    submission.points_awarded = @scholaistic_assessment.base_exp
    submission.course_user = current_course.course_users.find_by(user_id: creator.id)
    submission.awarded_at = Time.zone.now
    submission.awarder = User.system

    submission.save!
  end

  def submission_id
    params[:id]
  end
end
