# frozen_string_literal: true
class CreateRubricBasedGradingTable < ActiveRecord::Migration[7.2]
  def change
    create_table :course_assessment_question_rubric_based_responses do |t|
    end

    create_table :course_assessment_question_rubric_based_response_categories do |t|
      t.references :question, null: false,
                   index: {
                     name: :fk__course_assessment_rubric_question_categories
                   },
                   foreign_key: {
                     to_table: :course_assessment_question_rubric_based_responses
                   }
      t.text :name, null: false
      t.boolean :is_bonus_category, null: false, default: 0
    end

    create_table :course_assessment_question_rubric_based_response_criterions do |t|
      t.references :category, null: false,
                   index: {
                     name: :fk__course_assessment_rubric_question_category_criterions
                   },
                   foreign_key: {
                     to_table: :course_assessment_question_rubric_based_response_categories
                   }
      t.integer :grade, null: false, default: 0
      t.text :explanation, null: false
    end

    create_table :course_assessment_answer_rubric_based_responses do |t|
      t.string :answer_text, null: true
    end

    create_table :course_assessment_answer_rubric_based_response_selections do |t|
      t.references :answer, null: false,
                   index: {
                     name: :fk__course_assessment_answer_rubric_based_response_selections
                   },
                   foreign_key: {
                     to_table: :course_assessment_answer_rubric_based_responses
                   }
      t.references :category, null: false,
                    index: {
                      name: :fk__course_assessment_answer_rubric_based_category_selections
                    },
                    foreign_key: {
                      to_table: :course_assessment_question_rubric_based_response_categories
                    }
      t.references :criterion, null: true,
                    index: {
                      name: :fk__course_assessment_answer_rubric_based_question_criterions
                    },
                    foreign_key: {
                      to_table: :course_assessment_question_rubric_based_response_criterions
                    }
      t.integer :grade, null: true
      t.text :explanation, null: true
    end
  end
end
