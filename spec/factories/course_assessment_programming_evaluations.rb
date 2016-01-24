# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_programming_evaluation,
          class: Course::Assessment::ProgrammingEvaluation do
    course
    language { Coursemology::Polyglot::Language::Python::Python2Point7.instance }
    status :submitted
    package_path do
      File.join(Rails.root, '/spec/fixtures/course/programming_question_template.zip')
    end

    trait :assigned do
      status 'assigned'

      evaluator { build(:user) }
      assigned_at { Time.zone.now }
    end

    trait :completed do
      assigned

      status :completed
      stdout ''
      stderr ''
      exit_code 0
      test_report File.read(File.join(Rails.root,
                                      'spec/fixtures/course/programming_multiple_test_suite_report'\
                                      '.xml'))
    end

    trait :errored do
      assigned

      status :errored
      stdout ''
      stderr 'Error Trait'
      exit_code 1
      test_report ''
    end
  end
end
