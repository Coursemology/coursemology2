FactoryGirl.define do
  factory :course_assessment_submission, class: Course::Assessment::Submission,
                                         parent: :course_experience_points_record,
                                         aliases: [:submission] do
    assessment { build(:assessment, course: course) }
    # workflow_state 'created'
  end
end
