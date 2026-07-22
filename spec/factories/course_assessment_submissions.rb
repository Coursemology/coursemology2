# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_submission, class: Course::Assessment::Submission,
                                         parent: :course_experience_points_record,
                                         aliases: [:submission] do
    transient do
      grader { User.stamper }
      auto_grade { true } # Used only with any of the submitted or finalised traits.
      creator
      assessment { create(:assessment, :with_mcq_question, course: course) }
    end

    # `assessment`/`creator` above build the backing Attempt, not Submission's own (nonexistent)
    # columns — this preserves every existing `create(:submission, assessment: foo)` call site's
    # literal syntax (FactoryBot treats transient/real attribute overrides identically), while no
    # longer trying to assign a nonexistent `submission.assessment=`.
    #
    # `creator: creator` must be threaded through explicitly: a bare `creator` inside `transient do
    # ... end` is NOT actually inert here — `:creator` is a registered alias of the `:user` factory
    # (spec/factories/users.rb), so FactoryBot resolves it as an implicit `Attribute::Association`,
    # which the gem *always* builds with `ignored: false` regardless of being declared inside
    # `transient` (`factory_bot/attribute/association.rb` hardcodes `super(name, false)`). Pre-split,
    # that meant `submission.creator = <built/overridden user>` landed directly on Submission's own
    # (real, userstamp) `creator` column. Post-split, Submission has no `creator=` writer of its own
    # (only a delegated reader) — the same assignment now silently falls through to
    # `acts_as`'s `method_missing` and sets `experience_points_record.creator` instead (harmless
    # duplication of the final `after(:build)` hook below, but it leaves `attempt.creator` unset).
    # Passing `creator:` straight into the Attempt's own build restores the pre-split guarantee that
    # `create(:submission, creator: X)` actually makes `submission.creator == X` — required for
    # `validate_consistent_user` (`course_user.user == creator`) to ever pass. Mechanical fix,
    # reproduced via `FactoryBot.build(:submission, creator: X, course_user: cu_for_X).valid?` →
    # `experience_points_record inconsistent_user` (attempt.creator was nil, not X).
    attempt { association(:course_assessment_attempt, assessment: assessment, creator: creator) }
    points_awarded { nil }

    trait :attempting do
      after(:build) do |submission|
        # `Answer#submission` now targets `Course::Assessment::Attempt` (the FK repoint, Step 2d) —
        # `.attempt(submission)` here must be given the Attempt, not the Submission, or building
        # the new answer raises `ActiveRecord::AssociationTypeMismatch`. Mechanical fix; the
        # question-attempt logic itself is otherwise unchanged.
        submission.answers = submission.assessment.questions.attempt(submission.attempt)
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
          answer.grade = Random.new.rand(answer.question.maximum_grade)
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
        answers = submission.assessment.questions.attempt(submission.attempt)
        answers.map do |answer|
          answer.current_answer = false
          answer.save!
        end

        submission.answers << answers
      end
    end

    trait :with_past_answers do
      after(:build) do |submission|
        old_answers = submission.assessment.questions.attempt(submission.attempt)
        old_answers.map do |answer|
          answer.created_at = Time.zone.now - 1.day
          answer.finalise!
          answer.save!
        end
        submission.answers << old_answers

        new_answers = submission.assessment.questions.attempt(submission.attempt)
        new_answers.map do |answer|
          answer.current_answer = true
          answer.finalise!
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
      user = evaluator.creator || submission.creator
      submission.experience_points_record.creator = user
    end
  end
end
