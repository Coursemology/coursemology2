class RemoveLiveFeedbackSettingsFromAssessment < ActiveRecord::Migration[7.0]
  def change
    remove_column :course_assessments, :live_feedback_enabled, :boolean
  end
end
