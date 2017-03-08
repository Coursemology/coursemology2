# frozen_string_literal: true
FactoryGirl.define do
  factory :course_virtual_classroom, class: 'Course::VirtualClassroom' do
    course
    sequence(:title) { |n| "VirtualClassroom #{n}" }
    sequence(:content) { |n| "Content #{n}" }
    start_at { Time.zone.now }
    end_at { 1.hour.from_now }

    trait :not_started do
      start_at { 1.day.from_now }
      end_at { 25.hours.from_now }
    end

    trait :ended do
      start_at { 1.week.ago }
      end_at { (24 * 7 + 1).hours.ago }
    end
  end
end
