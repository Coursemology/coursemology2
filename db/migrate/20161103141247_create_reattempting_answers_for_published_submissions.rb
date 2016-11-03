class CreateReattemptingAnswersForPublishedSubmissions < ActiveRecord::Migration
  def up
    guided_ids = Course::Assessment.guided.pluck(:id)
    Course::Assessment::Submission.
      where { id >> guided_ids }.
      includes(assessment: :questions).
      each do |submission|
        submission.assessment.questions.attempt(submission, reattempt: true)
      end
  end

  def down
    Course::Assessment::Answer.with_reattempting_state.destroy_all
  end
end
