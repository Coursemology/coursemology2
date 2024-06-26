# frozen_string_literal: true
module Course::Video::Submission::Statistic::CikgoTaskCompletionConcern
  extend ActiveSupport::Concern

  included do
    after_save :publish_task_completion, if: :should_publish_task_completion?
  end

  private

  COMPLETED_MINIMUM_WATCH_PERCENTAGE = 90

  delegate :edit_course_video_submission_url, to: 'Rails.application.routes.url_helpers'

  def publish_task_completion
    Cikgo::ResourcesService.mark_task!(status, lesson_plan_item, { user_id: creator_id_on_cikgo, url: submission_url })
  rescue StandardError => e
    Rails.logger.error("Cikgo: Cannot publish task completion for video submission #{submission_id}: #{e}")
    raise e unless Rails.env.production?
  end

  def status
    (percent_watched >= COMPLETED_MINIMUM_WATCH_PERCENTAGE) ? :completed : :ongoing
  end

  def submission_url
    edit_course_video_submission_url(lesson_plan_item.course_id, submission.video_id, submission_id,
                                     host: lesson_plan_item.course.instance.host, protocol: :https)
  end

  def should_publish_task_completion?
    lesson_plan_item.course.component_enabled?(Course::StoriesComponent) && creator_id_on_cikgo.present?
  end

  def lesson_plan_item
    @lesson_plan_item ||= submission.video.acting_as
  end

  def creator_id_on_cikgo
    @creator_id_on_cikgo ||= submission.creator.cikgo_user&.provided_user_id
  end
end
