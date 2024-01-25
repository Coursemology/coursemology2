# frozen_string_literal: true
module Course::Assessment::Submission::GenieTaskCompletionConcern
  WORKFLOW_STATE_TO_TASK_COMPLETION_STATUS = {
    attempting: :ongoing,
    submitted: :ongoing,
    published: :completed
  }.freeze

  extend ActiveSupport::Concern

  included do
    after_save :publish_task_completion, if: :saved_change_to_workflow_state?
  end

  private

  delegate :edit_course_assessment_submission_url, to: 'Rails.application.routes.url_helpers'

  def publish_task_completion
    return unless creator_id_on_genie

    status = WORKFLOW_STATE_TO_TASK_COMPLETION_STATUS[workflow_state.to_sym]
    return unless status

    lesson_plan_item = assessment.acting_as

    GenieApiService.mark_task(status, {
      item_id: lesson_plan_item.id,
      course_id: lesson_plan_item.course_id,
      user_id: creator_id_on_genie,
      url: edit_course_assessment_submission_url(lesson_plan_item.course_id, assessment_id, id)
    })
  end

  def creator_id_on_genie
    @creator_id_on_genie ||= creator.genie_user.provided_user_id
  end
end
