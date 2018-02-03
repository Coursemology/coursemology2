class RenameProgrammingAutoGradingTestResultMessages < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessment_answer_programming_auto_grading_test_results, :messages, :jsonb,
               null: false, default: '{}'
    serialize_existing_message
    remove_column :course_assessment_answer_programming_auto_grading_test_results, :message
  end

  # message column currently stores test_case.error_message
  def serialize_existing_message
    Course::Assessment::Answer::ProgrammingAutoGradingTestResult.reset_column_information
    Course::Assessment::Answer::ProgrammingAutoGradingTestResult.where.not(message: nil).
      find_in_batches do |group|
      group.each do |test_result|
        test_result.update_column(:messages, 'error': test_result.message)
      end
    end
  end
end
