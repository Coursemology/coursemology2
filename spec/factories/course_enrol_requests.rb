# frozen_string_literal: true
FactoryBot.define do
  factory :course_enrol_request, class: 'Course::EnrolRequest' do
    course
    user

    trait :pending do
      workflow_state { :pending }
    end

    trait :approved do
      workflow_state { :approved }
    end

    trait :rejected do
      workflow_state { :rejected }
    end
  end
end
