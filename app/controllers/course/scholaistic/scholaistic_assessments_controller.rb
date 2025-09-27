# frozen_string_literal: true
class Course::Scholaistic::ScholaisticAssessmentsController < Course::Scholaistic::Controller
  load_and_authorize_resource :scholaistic_assessment, through: :course, class: Course::ScholaisticAssessment.name

  before_action :sync_scholaistic_assessments!, only: [:index, :show, :edit]

  def index
    submissions_status_hash = ScholaisticApiService.submissions!(
      @scholaistic_assessments.map(&:upstream_id),
      current_course_user
    )

    @assessments_status = @scholaistic_assessments.to_h do |assessment|
      submission_status = submissions_status_hash[assessment.upstream_id]&.[](:status)

      [assessment.id,
       if submission_status == :graded
         :submitted
       elsif submission_status.present?
         submission_status
       else
         can_attempt_scholaistic_assessment?(assessment) ? :open : :unavailable
       end]
    end
  end

  def new
    @embed_src = ScholaisticApiService.embed!(
      current_course_user,
      ScholaisticApiService.new_assessment_path,
      request.origin
    )
  end

  def show
    upstream_id = @scholaistic_assessment.upstream_id

    @embed_src =
      ScholaisticApiService.embed!(
        current_course_user,
        if can?(:update, @scholaistic_assessment)
          ScholaisticApiService.edit_assessment_path(upstream_id)
        else
          ScholaisticApiService.assessment_path(upstream_id)
        end,
        request.origin
      )
  end

  def edit
    @embed_src = ScholaisticApiService.embed!(
      current_course_user,
      ScholaisticApiService.edit_assessment_details_path(@scholaistic_assessment.upstream_id),
      request.origin
    )
  end

  def update
    if @scholaistic_assessment.update(update_params)
      head :ok
    else
      render json: { errors: @scholaistic_assessment.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def update_params
    params.require(:scholaistic_assessment).permit(:base_exp)
  end

  def sync_scholaistic_assessments!
    response = ScholaisticApiService.assessments!(current_course)

    # TODO: The SQL queries will scale proportionally with `response[:assessments].size`,
    # but we won't always have to sync all assessments since there's `last_synced_at`.
    # In the future, we can optimise this, but it's not easy because there are multiple
    # relations to `Course::ScholaisticAssessment` that need to be updated.
    ActiveRecord::Base.transaction do
      response[:assessments].map do |assessment|
        current_course.scholaistic_assessments.find_or_initialize_by(
          upstream_id: assessment[:upstream_id]
        ).tap do |scholaistic_assessment|
          scholaistic_assessment.start_at = assessment[:start_at]
          scholaistic_assessment.end_at = assessment[:end_at]
          scholaistic_assessment.title = assessment[:title]
          scholaistic_assessment.description = assessment[:description]
          scholaistic_assessment.published = assessment[:published]
        end.save!
      end

      if response[:deleted].present? && !current_course.scholaistic_assessments.
         where(upstream_id: response[:deleted]).destroy_all
        raise ActiveRecord::Rollback
      end

      current_course.settings(:course_scholaistic_component).public_send('last_synced_at=', response[:last_synced_at])

      current_course.save!
    end
  end

  def submission_status(assessment)
  end
end
