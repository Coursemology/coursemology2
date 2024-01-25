# frozen_string_literal: true
module Course::Survey::Response::GenieTaskCompletionConcern
  extend ActiveSupport::Concern

  included do
    # TODO: Combine to `after_save` with `previously_new_record? || saved_change_to_submitted_at?`
    # once up to Rails 6.1+. `previously_new_record?` is only available from Rails 6.1+.
    # See https://apidock.com/rails/v6.1.3.1/ActiveRecord/Persistence/previously_new_record%3F
    after_create :publish_task_completion
    after_update :publish_task_completion, if: :saved_change_to_submitted_at?
  end

  private

  delegate :edit_course_survey_response_url, to: 'Rails.application.routes.url_helpers'

  def publish_task_completion
    return unless creator_id_on_genie

    lesson_plan_item = survey.acting_as
    status = submitted? ? :completed : :ongoing

    GenieApiService.mark_task(status, {
      item_id: lesson_plan_item.id,
      course_id: lesson_plan_item.course_id,
      user_id: creator_id_on_genie,
      url: edit_course_survey_response_url(lesson_plan_item.course_id, survey_id, id)
    })
  end

  def creator_id_on_genie
    @creator_id_on_genie ||= creator.genie_user.provided_user_id
  end
end
