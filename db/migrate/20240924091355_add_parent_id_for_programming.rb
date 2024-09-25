class AddParentIdForProgramming < ActiveRecord::Migration[7.0]
  def change
    add_column :course_assessment_answer_programming_auto_gradings, :parent_id, :integer
     # Manual definition of name is needed because default name is too long
    add_index :course_assessment_answer_programming_auto_gradings, :parent_id, name: 'index_ca_answer_programming_auto_gradings_on_parent_id'  
    add_foreign_key :course_assessment_answer_programming_auto_gradings, :course_assessment_answer_programming_auto_gradings, column: :parent_id

    add_column :course_assessment_question_programming, :parent_id, :integer
    # Manual definition of name is needed because default name is too long
    add_index :course_assessment_question_programming, :parent_id, name: 'index_ca_question_programming_on_parent_id'
    add_foreign_key :course_assessment_question_programming, :course_assessment_question_programming, column: :parent_id
  end
end
