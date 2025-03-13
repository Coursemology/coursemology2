# frozen_string_literal: true
module Course::Assessment::Submission::CikgoTaskCompletionConcern
  WORKFLOW_STATE_TO_TASK_COMPLETION_STATUS = {
    attempting: :ongoing,
    submitted: :ongoing,
    graded: :ongoing,
    published: :completed
  }.freeze

  extend ActiveSupport::Concern

  included do
    after_save :publish_task_completion, if: -> { should_publish_task_completion? && saved_change_to_workflow_state? }
  end

  private

  delegate :edit_course_assessment_submission_url, to: 'Rails.application.routes.url_helpers'

  def publish_task_completion
    Cikgo::ResourcesService.mark_task!(status, lesson_plan_item, {
      user_id: creator_id_on_cikgo,
      url: submission_url,
      score: grade&.to_i
    })
  rescue StandardError => e
    Rails.logger.error("Cikgo: Cannot publish task completion for submission #{id}: #{e}")
    raise e unless Rails.env.production?
  end

  def status
    WORKFLOW_STATE_TO_TASK_COMPLETION_STATUS[workflow_state.to_sym]
  end

  def submission_url
    edit_course_assessment_submission_url(
      lesson_plan_item.course_id, assessment_id, id, host: lesson_plan_item.course.instance.host, protocol: :https
    )
  end

  def should_publish_task_completion?
    lesson_plan_item.course.component_enabled?(Course::StoriesComponent) &&
      creator_id_on_cikgo.present? && status.present?
  end

  def lesson_plan_item
    @lesson_plan_item ||= assessment.acting_as
  end

  def creator_id_on_cikgo
    @creator_id_on_cikgo ||= creator.cikgo_user&.provided_user_id
  end
end
