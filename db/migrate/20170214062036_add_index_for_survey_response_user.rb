class AddIndexForSurveyResponseUser < ActiveRecord::Migration
  def change
    add_index :course_survey_responses, [:survey_id, :creator_id], unique: true
  end
end
