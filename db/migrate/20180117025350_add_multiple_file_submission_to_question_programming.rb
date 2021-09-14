class AddMultipleFileSubmissionToQuestionProgramming < ActiveRecord::Migration[5.1]
  def up
    add_column :course_assessment_question_programming, :multiple_file_submission, :boolean, default: false, null: false

    # Finds all Coursemology::Polyglot::Language::Java programming questions
    language_id = Coursemology::Polyglot::Language::Java.ids.first
    Course::Assessment::Question::Programming.where(language_id: language_id).find_each do |question|
      begin
        service = Course::Assessment::Question::Programming::ProgrammingPackageService.new(question, nil)
        meta = service.extract_meta
        question.update_column(:multiple_file_submission, true) if meta && meta[:data] && meta[:data]['submit_as_file']
      rescue StandardError
      end
    end
  end

  def down
    remove_column :course_assessment_question_programming, :multiple_file_submission
  end
end
