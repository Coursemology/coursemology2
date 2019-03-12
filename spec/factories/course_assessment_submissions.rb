# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_submission, class: Course::Assessment::Submission,
                                         parent: :course_experience_points_record,
                                         aliases: [:submission] do
    transient do
      grader { User.stamper }
      auto_grade { true } # Used only with any of the submitted or finalised traits.
      creator
    end
    assessment { create(:assessment, :with_mcq_question, course: course) }
    points_awarded { nil }

    trait :attempting do
      after(:build) do |submission|
        submission.answers = submission.assessment.questions.attempt(submission)
        # These are the first answers, so set their `current_answer` flag.
        submission.answers.map do |answer|
          answer.current_answer = true
          answer.save!
        end
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

    trait :attempting_with_past_answers do
      attempting
      after(:build) do |submission|
        answers = submission.assessment.questions.attempt(submission)
        answers.map do |answer|
          answer.current_answer = false
          answer.save!
        end

        submission.answers << answers
      end
    end

    trait :with_past_answers do
      after(:build) do |submission|
        old_answers = submission.assessment.questions.attempt(submission)
        old_answers.map do |answer|
          answer.created_at = Time.zone.now - 1.day
          answer.save!
        end
        submission.answers << old_answers

        new_answers = submission.assessment.questions.attempt(submission)
        new_answers.map do |answer|
          answer.current_answer = true
          answer.save!
        end
        submission.answers << new_answers
      end
    end

    trait :submitted_with_past_answers do
      with_past_answers
      after(:build) do |submission, evaluator|
        submission.finalise!
        answer.send(:clear_attribute_changes, :workflow_state) unless evaluator.auto_grade

        submission.awarder = nil
        submission.awarded_at = nil
        submission.submitted_at = evaluator.submitted_at if evaluator.submitted_at
      end
    end

    # Ensure that creator of submission is the same as creator of experience_points_record
    after(:build) do |submission, evaluator|
      user = evaluator.creator ? evaluator.creator : submission.creator
      submission.experience_points_record.creator = user
    end
  end
end
