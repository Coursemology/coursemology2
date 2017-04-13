# frozen_string_literal: true
FactoryGirl.define do
  sequence(:course_survey_section_title) { |n| "Survey Section #{n}" }
  factory :course_survey_section, class: Course::Survey::Section.name, aliases: [:section] do
    transient do
      last_weight { survey.sections.maximum(:weight) }
      question_count 1
    end

    survey
    weight { last_weight ? last_weight + 1 : 0 }
    title { generate(:course_survey_section_title) }

    trait :with_text_question do
      after(:build) do |section, evaluator|
        evaluator.question_count.downto(1).each do
          question = build(:course_survey_question, :text, section: section)
          section.questions << question
        end
      end
    end

    trait :with_mcq_question do
      after(:build) do |section, evaluator|
        evaluator.question_count.downto(1).each do
          question = build(:course_survey_question, :multiple_choice, section: section)
          section.questions << question
        end
      end
    end

    trait :with_mrq_question do
      after(:build) do |section, evaluator|
        evaluator.question_count.downto(1).each do
          question = build(:course_survey_question, :multiple_response, section: section)
          section.questions << question
        end
      end
    end

    trait :with_all_question_types do
      with_text_question
      with_mcq_question
      with_mrq_question
    end
  end
end
