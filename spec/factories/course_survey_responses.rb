# frozen_string_literal: true
FactoryBot.define do
  factory :course_survey_response, class: Course::Survey::Response.name, aliases: [:response],
                                   parent: :course_experience_points_record do
    transient do
      course
    end
    survey { build(:survey, course: course) }
    points_awarded { nil }

    trait :submitted do
      after(:build) do |response|
        response.submit(response.survey.bonus_end_at)
      end

      transient do
        submitted_time { 1.day.ago }
      end

      submitted_at { submitted_time }
      awarded_at { submitted_time }
      awarder { creator }
    end
  end
end
