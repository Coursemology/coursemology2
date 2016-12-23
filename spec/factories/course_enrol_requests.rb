# frozen_string_literal: true
FactoryGirl.define do
  factory :course_enrol_request, class: Course::EnrolRequest do
    course
    user
  end
end
