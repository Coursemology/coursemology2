# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_programming,
          class: 'Course::Assessment::Question::Programming',
          parent: :course_assessment_question do
    transient do
      template_package { false }
      template_file_count { 1 }
      test_case_count { 0 }
      private_test_case_count { 0 }
      evaluation_test_case_count { 0 }
      with_codaveri_question { false }
    end

    memory_limit { 32 }
    time_limit { 10 }
    attempt_limit { nil }
    language { Coursemology::Polyglot::Language::Python::Python3Point10.instance }
    template_files do
      template_file_count.downto(1).map do
        build(:course_assessment_question_programming_template_file, question: nil)
      end
    end
    imported_attachment do
      if template_package
        file = File.new(File.join(Rails.root, 'spec/fixtures/course/'\
                                              'programming_question_template.zip'), 'rb')
        AttachmentReference.new(file: file)
      end
    end
    package_type do
      template_package ? :zip_upload : :online_editor
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

    is_codaveri do
      with_codaveri_question ? true : false
    end
    codaveri_id do
      with_codaveri_question ? '6311a0548c57aae93d260927' : nil
    end
    codaveri_status do
      with_codaveri_question ? 200 : nil
    end
    codaveri_message do
      with_codaveri_question ? 'Problem successfully created' : nil
    end

    after(:build) do |question|
      # We don't want to evaluate the package to import test cases during creation, it will
      # overwrite the defined test cases.
      question.instance_eval do
        def skip_process_package?
          true
        end
      end
    end

    after(:create) do |question|
      question.instance_eval do
        def skip_process_package? # rubocop:disable Lint/UselessMethodDefinition
          super
        end
      end
    end

    trait :auto_gradable do
      template_package { true }
      test_case_count { 1 }
      private_test_case_count { 1 }
    end

    trait :multiple_file_submission do
      multiple_file_submission { true }
    end

    trait :with_codaveri_question do
      is_codaveri { true }
      codaveri_id { '6311a0548c57aae93d260927' }
      codaveri_status { 200 }
      codaveri_message { 'Problem successfully created' }
    end
  end
end
