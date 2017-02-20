class RemoveImageFromSurveyQuestionOption < ActiveRecord::Migration
  def change
    remove_column :course_survey_question_options, :image, :text
  end
end
