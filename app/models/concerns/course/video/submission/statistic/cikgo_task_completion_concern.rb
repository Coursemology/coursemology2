# frozen_string_literal: true
module Course::Video::Submission::Statistic::CikgoTaskCompletionConcern
  COMPLETED_MINIMUM_WATCH_PERCENTAGE = 90

  extend ActiveSupport::Concern

  included do
    after_save :publish_task_completion
  end

  private

  delegate :edit_course_video_submission_url, to: 'Rails.application.routes.url_helpers'

  def publish_task_completion
    return unless creator_id_on_cikgo

    lesson_plan_item = submission.video.acting_as
    status = (percent_watched >= COMPLETED_MINIMUM_WATCH_PERCENTAGE) ? :completed : :ongoing

    Cikgo::ResourcesService.mark_task(status, lesson_plan_item, {
      user_id: creator_id_on_cikgo,
      url: edit_course_video_submission_url(
        lesson_plan_item.course_id,
        submission.video_id,
        submission_id,
        host: lesson_plan_item.course.instance.host,
        protocol: :https
      )
    })
  end

  def creator_id_on_cikgo
    @creator_id_on_cikgo ||= submission.creator.cikgo_user.provided_user_id
  end
end
