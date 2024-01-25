# frozen_string_literal: true
module Course::Video::Submission::Statistic::GenieTaskCompletionConcern
  COMPLETED_MINIMUM_WATCH_PERCENTAGE = 90

  extend ActiveSupport::Concern

  included do
    after_save :publish_task_completion
  end

  private

  delegate :edit_course_video_submission_url, to: 'Rails.application.routes.url_helpers'

  def publish_task_completion
    return unless creator_id_on_genie

    lesson_plan_item = submission.video.acting_as
    status = (percent_watched >= COMPLETED_MINIMUM_WATCH_PERCENTAGE) ? :completed : :ongoing

    GenieApiService.mark_task(status, {
      item_id: lesson_plan_item.id,
      course_id: lesson_plan_item.course_id,
      user_id: creator_id_on_genie,
      url: edit_course_video_submission_url(lesson_plan_item.course_id, submission.video_id, submission_id)
    })
  end

  def creator_id_on_genie
    @creator_id_on_genie ||= submission.creator.genie_user.provided_user_id
  end
end
