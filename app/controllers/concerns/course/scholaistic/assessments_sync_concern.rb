# frozen_string_literal: true
module Course::Scholaistic::AssessmentsSyncConcern
  extend ActiveSupport::Concern

  private

  def sync_scholaistic_assessments!
    # return unless current_course.component_enabled?(Course::ScholaisticComponent) &&
    #               current_course.settings.course_scholaistic_component&.linked?

    response = ScholaisticApiService.assessments!(current_course)

    ActiveRecord::Base.transaction do
      raise ActiveRecord::Rollback unless Course::Scholaistic::Assessment.upsert_all(
        response[:assessments].map do |assessment|
          {
            upstream_id: assessment[:upstream_id],
            published: assessment[:published],
            title: assessment[:title],
            description: assessment[:description]
          }
        end, unique_by: :upstream_id
      )

      settings(course).update!(last_synced_at: response[:last_synced_at])
    end
  end

  def sync_scholaistic_assessments
    sync_scholaistic_assessments!
  rescue StandardError => e
    Rails.logger.error("Failed to sync assessments: #{e.message}")
    raise e unless Rails.env.production?
  end
end

Course::Scholaistic::Assessment.create(
  upstream_id: '12345',
  published: true,
  title: 'Sample Assessment'
)
