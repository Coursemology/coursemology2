# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_programming_upgrade,
          class: 'Course::Assessment::Question::ProgrammingUpgrade' do
    transient do
      # By default the row describes the question's current package, so it is authoritative.
      authoritative { true }
    end

    association :question, factory: :course_assessment_question_programming
    old_language { Coursemology::Polyglot::Language::Python::Python3Point9.instance }
    new_language { Coursemology::Polyglot::Language::Python::Python3Point10.instance }
    attachment { authoritative ? question.attachment&.attachment : nil }

    trait :running do
      workflow_state { :running }
    end

    trait :completed do
      workflow_state { :completed }
    end

    trait :failed do
      workflow_state { :failed }
    end

    trait :reverting do
      workflow_state { :reverting }
    end

    trait :stale do
      workflow_state { :running }
      updated_at { Course::Assessment::Question::ProgrammingUpgrade::STALE_AFTER.ago - 1.minute }
    end
  end
end
