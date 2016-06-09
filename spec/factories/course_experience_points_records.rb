# frozen_string_literal: true
FactoryGirl.define do
  factory :course_experience_points_record, class: Course::ExperiencePointsRecord.name do
    transient do
      course { build(:course) }
      creator
    end

    course_user do
      course.course_users.find_by(user: creator) ||
        build(:course_user, course: course, user: creator)
    end
    points_awarded { rand(1..20) * 100 }
    reason { 'Reason for manually-awarded experience points' if manually_awarded? }

    trait :inactive do
      points_awarded nil
    end
  end
end
