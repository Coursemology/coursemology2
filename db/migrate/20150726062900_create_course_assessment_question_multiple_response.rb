# frozen_string_literal: true
class CreateCourseAssessmentQuestionMultipleResponse < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessment_questions, :title, :string, null: false, default: ''
    change_column_default :course_assessment_questions, :title, nil
    change_column_null :course_assessment_questions, :description, true
    add_column :course_assessment_questions, :maximum_grade, :integer, null: false, default: 1
    change_column_default :course_assessment_questions, :maximum_grade, nil

    create_table :course_assessment_question_multiple_responses do |t|
      t.integer :question_type, null: false, default: 0
    end

    create_table :course_assessment_question_multiple_response_options do |t|
      t.references :question,
                   null: false,
                   index: {
                     name: :fk__course_assessment_multiple_response_option_question
                   },
                   foreign_key: {
                     references: :course_assessment_question_multiple_responses
                   }
      t.boolean :correct, null: false
      t.string :option, null: false
      t.string :explanation, null: false
    end

    create_table :course_assessment_answer_multiple_responses do
    end

    create_table :course_assessment_answer_multiple_response_options do |t|
      t.references :answer,
                   null: false,
                   index: {
                     name: :fk__course_assessment_multiple_response_option_answer
                   },
                   foreign_key: {
                     references: :course_assessment_answer_multiple_responses
                   }
      t.references :option,
                   null: false,
                   index: {
                     name: :fk__course_assessment_multiple_response_option_question_option
                   },
                   foreign_key: {
                     references: :course_assessment_question_multiple_response_options
                   }
    end
  end
end
