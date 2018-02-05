class AddSurveyBooleans < ActiveRecord::Migration[4.2]
  def change
    add_column :course_surveys, :anonymous, :bool, null: false, default: false
    add_column :course_surveys, :allow_modify, :bool, null: false, default: false
    add_column :course_survey_questions, :grid_view, :bool, null: false, default: false
  end
end
