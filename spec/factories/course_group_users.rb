# frozen_string_literal: true
FactoryBot.define do
  factory :course_group_user, class: Course::GroupUser.name do
    transient do
      course { build(:course) }
    end

    group { build(:course_group, course: course) }
    course_user { build(:course_user, course: course) }

    role :normal

    factory :course_group_student
    factory :course_group_manager do
      role :manager
    end
  end
end
