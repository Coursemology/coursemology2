# frozen_string_literal: true
FactoryGirl.define do
  sequence(:course_survey_section_title) { |n| "Survey Section #{n}" }
  factory :course_survey_section, class: Course::Survey::Section.name, aliases: [:section] do
    transient do
      last_weight { survey.sections.maximum(:weight) }
    end

    survey
    weight { last_weight ? last_weight + 1 : 0 }
    title { generate(:course_survey_section_title) }
  end
end
