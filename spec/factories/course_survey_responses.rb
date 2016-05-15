# frozen_string_literal: true
FactoryGirl.define do
  factory :course_survey_response, class: Course::Survey::Response.name, aliases: [:response],
                                   parent: :course_experience_points_record do
    survey { build(:survey, course: course) }
  end
end
