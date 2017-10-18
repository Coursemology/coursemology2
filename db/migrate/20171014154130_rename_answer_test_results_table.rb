class RenameAnswerTestResultsTable < ActiveRecord::Migration
  def change
    # The long table name caused the default primary key value being stored in the schema, AR behaves wrongly and always
    # sets the PK to the same value after that.
    rename_table :course_assessment_answer_programming_auto_grading_test_results,
                 :course_assessment_answer_programming_test_results
  end
end
