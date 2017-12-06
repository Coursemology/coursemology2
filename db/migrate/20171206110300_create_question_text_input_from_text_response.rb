class CreateQuestionTextInputFromTextResponse < ActiveRecord::Migration[5.0]
  def change
    add_column :course_assessment_question_text_responses, :is_comprehension, :boolean, default: false

    create_table :course_assessment_question_text_response_groups do |t|
      t.references :question,
                   null: false,
                   index: {
                     name: :fk__course_assessment_text_response_group_question
                   }
      t.decimal :maximum_group_grade, precision: 4, scale: 1, null: false, default: 0.0
      t.integer :group_weight, null: true
    end

    create_table :course_assessment_question_text_response_points do |t|
      t.references :group,
                   null: false,
                   index: {
                     name: :fk__course_assessment_text_response_point_group
                   }
      t.decimal :maximum_point_grade, precision: 4, scale: 1, null: false, default: 0.0
      t.integer :point_weight, null: true
    end

    rename_column :course_assessment_question_text_response_solutions,
                  :solution, :solution_old

    add_column :course_assessment_question_text_response_solutions,
               :solution, :text, array: true, null: false, default: []

    add_column :course_assessment_question_text_response_solutions,
               :solution_lemma, :text, array: true, null: true, default: []

    add_column :course_assessment_question_text_response_solutions,
               :weight, :integer, null: true

    add_reference :course_assessment_question_text_response_solutions,
                  :point,
                  index: {
                    name: :fk__course_assessment_text_response_solution_point
                  }
  end
end
