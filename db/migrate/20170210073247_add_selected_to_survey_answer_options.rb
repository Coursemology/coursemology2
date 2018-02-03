class AddSelectedToSurveyAnswerOptions < ActiveRecord::Migration[4.2]
  def change
    add_column :course_survey_answer_options, :selected, :boolean, default: false, null: false
  end
end
