# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_answer, class: Course::Assessment::Answer do
    transient do
      course { build(:course) }
      assessment { build(:assessment, course: course) }
      submission_traits []
    end

    submission do
      traits = *submission_traits
      options = traits.extract_options!
      options[:assessment] = question.assessment
      build(:course_assessment_submission, *traits, options)
    end
    question { build(:course_assessment_question, assessment: assessment) }

    trait :submitted do
      submission_traits :submitted
      after(:build) do |answer| # rubocop:disable Style/SymbolProc
        answer.finalise!
      end
    end

    trait :graded do
      submitted
      submission_traits :graded
      after(:build) do |answer| # rubocop:disable Style/SymbolProc
        answer.publish!
      end
    end
  end
end
