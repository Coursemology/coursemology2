# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_question_programming,
          class: Course::Assessment::Question::Programming,
          parent: :course_assessment_question do
    transient do
      template_package false
      template_package_deferred true # Set false to immediately assign the package to the question.
      template_file_count 1
      test_case_count 0
      private_test_case_count 0
      evaluation_test_case_count 0
    end

    memory_limit 32
    time_limit 10
    attempt_limit 3
    language { Coursemology::Polyglot::Language::Python::Python2Point7.instance }
    template_files do
      template_file_count.downto(1).map do
        build(:course_assessment_question_programming_template_file, question: nil)
      end
    end
    file do
      File.new(File.join(Rails.root, 'spec/fixtures/course/'\
                         'programming_question_template.zip'), 'rb') if template_package
    end
    test_cases do
      public_test_cases = test_case_count.downto(1).map do
        build(:course_assessment_question_programming_test_case, question: nil)
      end

      private_test_cases = private_test_case_count.downto(1).map do
        build(:course_assessment_question_programming_test_case, :private, question: nil)
      end

      evaluation_test_cases = evaluation_test_case_count.downto(1).map do
        build(:course_assessment_question_programming_test_case, :evaluation, question: nil)
      end

      public_test_cases + private_test_cases + evaluation_test_cases
    end

    after(:build) do |question, evaluator|
      # Suppress the deferred assignment of the attachment.
      question.send(:clear_attribute_changes, :attachment) unless \
        evaluator.template_package_deferred
    end

    trait :auto_gradable do
      test_case_count 1
      private_test_case_count 1
    end
  end
end
