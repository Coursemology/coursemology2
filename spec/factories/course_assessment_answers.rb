# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_answer, class: Course::Assessment::Answer do
    transient do
      course { build(:course) }
      assessment { build(:assessment, course: course) }
      # The creator in userstamps must be persisted.
      creator { create(:user) }
      submission_traits []
    end

    submission do
      traits = *submission_traits
      options = traits.extract_options!
      options[:assessment] = question.assessment
      options[:creator] = creator
      options[:course] = course
      build(:course_assessment_submission, *traits, options)
    end
    question { build(:course_assessment_question, assessment: assessment) }

    trait :submitted do
      submission_traits :submitted
      after(:build) do |answer, evaluator|
        answer.finalise!
        # Revert submitted at if given.
        answer.submitted_at = evaluator.submitted_at if evaluator.submitted_at
      end
    end

    trait :evaluated do
      submission_traits :submitted
      submitted
      after(:build) do |answer, _evaluator|
        answer.evaluate!
      end
    end

    trait :graded do
      grade 0
      submitted
      submission_traits :graded
      after(:build) do |answer| # rubocop:disable Style/SymbolProc
        answer.publish!
      end
    end
  end
end
