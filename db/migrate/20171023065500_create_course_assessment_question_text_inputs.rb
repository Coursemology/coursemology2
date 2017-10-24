# frozen_string_literal: true
class CreateCourseAssessmentQuestionTextInputs < ActiveRecord::Migration
  def change
    create_table :course_assessment_question_text_inputs do |t|
      t.boolean 'allow_attachment', default: false
      t.boolean 'hide_text',        default: false
      t.boolean 'is_comprehension', default: false
    end

    create_table :course_assessment_question_text_input_groups do |t|
      t.references :question,
                   null: false,
                   index: {
                     name: :fk__course_assessment_text_input_group_question
                   },
                   foreign_key: {
                     references: :course_assessment_question_text_inputs
                   }
      t.decimal :maximum_group_grade, precision: 4, scale: 1, null: false, default: 0.0
    end

    create_table :course_assessment_question_text_input_points do |t|
      t.references :group,
                   null: false,
                   index: {
                     name: :fk__course_assessment_text_input_point_group
                   },
                   foreign_key: {
                     references: :course_assessment_question_text_input_groups
                   }
      t.decimal :maximum_point_grade, precision: 4, scale: 1, null: false, default: 0.0
    end

    create_table :course_assessment_question_text_input_solutions do |t|
      t.references :point,
                   null: false,
                   index: {
                     name: :fk__course_assessment_text_input_solution_point
                   },
                   foreign_key: {
                     references: :course_assessment_question_text_input_points
                   }
      t.integer :solution_type, null: false, default: 0
      t.text :solution, array: true, null: false, default: []
      t.text :solution_lemma, array: true, null: false, default: []
      t.decimal :grade, precision: 4, scale: 1, null: false, default: 0.0
      t.text :explanation, null: true
    end
  end
end
