# frozen_string_literal: true
FactoryGirl.define do
  factory :course_experience_points_record, class: Course::ExperiencePointsRecord.name do
    transient do
      course { build(:course) }
      user { build(:user) }
    end

    course_user do
      course.course_users.find_by(user: user) ||
        build(:course_user, course: course, user: user)
    end
    points_awarded { rand(1..20) * 100 }
    reason 'EXP for some event'

    trait :inactive do
      points_awarded nil
    end
  end
end
