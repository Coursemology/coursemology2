class CreateQuestionTextResponseComprehension < ActiveRecord::Migration[5.0]
  def change
    add_column :course_assessment_question_text_responses, :is_comprehension, :boolean, default: false

    create_table :course_assessment_question_text_response_compre_groups do |t|
      t.references :question,
                   null: false,
                   index: {
                     name: :fk__course_assessment_text_response_compre_group_question
                   },
                   foreign_key: {
                     to_table: :course_assessment_question_text_responses
                   }
      t.decimal :maximum_group_grade, precision: 4, scale: 1, null: false, default: 0.0
    end

    create_table :course_assessment_question_text_response_compre_points do |t|
      t.references :group,
                   null: false,
                   index: {
                     name: :fk__course_assessment_text_response_compre_point_group
                   },
                   foreign_key: {
                     to_table: :course_assessment_question_text_response_compre_groups
                   }
      t.decimal :point_grade, precision: 4, scale: 1, null: false, default: 0.0
    end

    create_table :course_assessment_question_text_response_compre_solutions do |t|
      t.references :point,
                   null: false,
                   index: {
                     name: :fk__course_assessment_text_response_compre_solution_point
                   },
                   foreign_key: {
                     to_table: :course_assessment_question_text_response_compre_points
                   }
      t.integer :solution_type, null: false, default: 0
      t.string :solution, array: true, null: false, default: []
      t.string :solution_lemma, array: true, null: false, default: []
      t.text :explanation, null: true
    end
  end
end
