# frozen_string_literal: true
class RemoveSelectedFromSurveyAnswerOptions < ActiveRecord::Migration[4.2]
  def change
    Course::Survey::AnswerOption.where(selected: false).delete_all
    remove_column :course_survey_answer_options, :selected, :boolean
  end
end
