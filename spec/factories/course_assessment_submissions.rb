# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_submission, class: Course::Assessment::Submission,
                                         parent: :course_experience_points_record,
                                         aliases: [:submission] do
    transient do
      grader { User.stamper }
      auto_grade true # Used only with any of the submitted or finalised traits.
      creator
    end
    assessment { build(:assessment, course: course) }
    points_awarded nil

    trait :attempting do
      after(:build) do |submission|
        submission.answers = submission.assessment.questions.attempt(submission)
      end
    end

    trait :submitted do
      attempting
      after(:build) do |submission, evaluator|
        submission.finalise!
        answer.send(:clear_attribute_changes, :workflow_state) unless evaluator.auto_grade

        submission.awarder = nil
        submission.awarded_at = nil
        submission.submitted_at = evaluator.submitted_at if evaluator.submitted_at
      end
    end

    trait :graded do
      submitted
      after(:build) do |submission, evaluator|
        submission.answers.each do |answer|
          answer.grade = Random::DEFAULT.rand(answer.question.maximum_grade)
          answer.grader = evaluator.grader
        end

        # Revert publisher and published at if given.
        submission.mark!
        submission.draft_points_awarded = rand(1..10) * 100
      end
    end

    trait :published do
      graded
      after(:build) do |submission, evaluator|
        # Revert publisher and published at if given.
        submission.publish!
        submission.publisher = evaluator.publisher if evaluator.publisher
        submission.published_at = evaluator.published_at if evaluator.published_at
        submission.points_awarded = rand(1..10) * 100
      end
    end

    # Ensure that creator of submission is the same as creator of experience_points_record
    after(:build) do |submission, evaluator|
      user = evaluator.creator ? evaluator.creator : submission.creator
      submission.experience_points_record.creator = user
    end
  end
end
