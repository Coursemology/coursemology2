class AddIndexForSurveyResponseUser < ActiveRecord::Migration[4.2]
  def change
    add_index :course_survey_responses, [:survey_id, :creator_id], unique: true
  end
end
