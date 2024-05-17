# frozen_string_literal: true
module Course::Survey::Response::CikgoTaskCompletionConcern
  extend ActiveSupport::Concern

  included do
    # TODO: Combine to `after_save` with `previously_new_record? || saved_change_to_submitted_at?`
    # once up to Rails 6.1+. `previously_new_record?` is only available from Rails 6.1+.
    # See https://apidock.com/rails/v6.1.3.1/ActiveRecord/Persistence/previously_new_record%3F
    after_create :publish_task_completion, if: :should_publish_task_completion?
    after_update :publish_task_completion, if: -> { should_publish_task_completion? && saved_change_to_submitted_at? }
  end

  private

  delegate :edit_course_survey_response_url, to: 'Rails.application.routes.url_helpers'

  def publish_task_completion
    Cikgo::ResourcesService.mark_task!(status, lesson_plan_item, { user_id: creator_id_on_cikgo, url: response_url })
  end

  def status
    submitted? ? :completed : :ongoing
  end

  def response_url
    edit_course_survey_response_url(lesson_plan_item.course_id, survey_id, id,
                                    host: lesson_plan_item.course.instance.host, protocol: :https)
  end

  def should_publish_task_completion?
    lesson_plan_item.course.component_enabled?(Course::StoriesComponent) && creator_id_on_cikgo.present?
  end

  def lesson_plan_item
    @lesson_plan_item ||= survey.acting_as
  end

  def creator_id_on_cikgo
    @creator_id_on_cikgo ||= creator.cikgo_user&.provided_user_id
  end
end
