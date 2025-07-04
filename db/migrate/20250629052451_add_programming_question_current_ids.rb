class AddProgrammingQuestionCurrentIds < ActiveRecord::Migration[7.2]
  def up
    # We set current_id values of all current questions to be equal to the question's own id.
    # This causes problems if we attempt a cascading delete directly on DB.
    add_reference :course_assessment_question_programming,
                  :current,
                  foreign_key: { to_table: :course_assessment_question_programming },
                  null: true
    add_column :course_assessment_question_programming,
               :snapshot_index,
               :integer
    add_column :course_assessment_question_programming,
               :snapshot_of_state_at,
               :datetime

    Course::Assessment::Question::Programming.reset_column_information
    migration_timestamp = Time.current
    Course::Assessment::Question::Programming.update_all(
      "current_id = id, snapshot_index = 0, snapshot_of_state_at = '#{migration_timestamp.utc.iso8601}'"
    )

    # Add not-null constraints after initialization
    change_column :course_assessment_question_programming,
                  :snapshot_index,
                  :integer,
                  null: false
    change_column :course_assessment_question_programming,
                  :snapshot_of_state_at,
                  :datetime,
                  null: false

    # This field is not initialized for performance reasons,
    # so we interpret null values as meaning the grading was done with the current question.
    add_reference :course_assessment_answer_programming_auto_gradings,
                  :question_snapshot,
                  foreign_key: { to_table: :course_assessment_question_programming },
                  null: true
  end

  def down
    remove_reference :course_assessment_answer_programming_auto_gradings, :question_snapshot
    remove_column :course_assessment_question_programming, :snapshot_of_state_at
    remove_column :course_assessment_question_programming, :snapshot_index
    remove_reference :course_assessment_question_programming, :current
  end
end
