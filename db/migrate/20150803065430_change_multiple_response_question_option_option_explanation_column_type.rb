# frozen_string_literal: true
class ChangeMultipleResponseQuestionOptionOptionExplanationColumnType < ActiveRecord::Migration[4.2]
  def up
    change_column :course_assessment_question_multiple_response_options, :option, :text
    change_column :course_assessment_question_multiple_response_options, :explanation, :text,
                  null: true
  end

  def down
    change_column :course_assessment_question_multiple_response_options, :option, :string
    change_column :course_assessment_question_multiple_response_options, :explanation, :string,
                  null: false
  end
end
