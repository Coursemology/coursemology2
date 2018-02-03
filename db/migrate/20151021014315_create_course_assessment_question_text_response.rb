# frozen_string_literal: true
class CreateCourseAssessmentQuestionTextResponse < ActiveRecord::Migration[4.2]
  def change
    create_table :course_assessment_question_text_responses do
    end

    create_table :course_assessment_question_text_response_solutions do |t|
      t.references :question,
                   null: false,
                   index: {
                     name: :fk__course_assessment_text_response_solution_question
                   },
                   foreign_key: {
                     references: :course_assessment_question_text_responses
                   }
      t.integer :solution_type, null: false, default: 0
      t.text :solution, null: false
      t.integer :grade, null: false, default: 0
      t.text :explanation, null: true
    end

    create_table :course_assessment_answer_text_responses do |t|
      t.text :answer_text, null: true
    end
  end
end
