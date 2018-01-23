class AddMultipleFileSubmissionToQuestionProgramming < ActiveRecord::Migration[5.1]
  def up
    add_column :course_assessment_question_programming, :multiple_file_submission, :boolean, default: false, null: false

    Course::Assessment::Question::Programming.find_each do |question|
      service = Course::Assessment::Question::Programming::ProgrammingPackageService.new(question, nil)
      meta = service.extract_meta
      question.update_attribute(:multiple_file_submission, true) if meta && meta[:data] && meta[:data]['submit_as_file']
    end
  end

  def down
    remove_column :course_assessment_question_programming, :multiple_file_submission
  end
end
