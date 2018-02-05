class RemoveImageFromSurveyQuestionOption < ActiveRecord::Migration[4.2]
  def change
    remove_column :course_survey_question_options, :image, :text
  end
end
