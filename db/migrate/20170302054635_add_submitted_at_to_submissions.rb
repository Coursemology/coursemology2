class AddSubmittedAtToSubmissions < ActiveRecord::Migration[4.2]
  # Add original calculated declaration for submitted_at to be used for data migration.
  class Course::Assessment::Submission
    calculated :old_submitted_at, (lambda do
      Course::Assessment::Answer.unscope(:order).where do
        course_assessment_answers.submission_id == course_assessment_submissions.id
      end.select { max(course_assessment_answers.submitted_at) }
    end)
  end

  def up
    add_column :course_assessment_submissions, :submitted_at, :datetime
    populate_submitted_at_to_submissions
  end

  def down
    remove_column :course_assessment_submissions, :submitted_at
  end

  def populate_submitted_at_to_submissions
    Course::Assessment::Submission.confirmed.calculated(:old_submitted_at).find_each do |submission|
      submission.update_column(:submitted_at, submission.old_submitted_at)
    end
  end
end
