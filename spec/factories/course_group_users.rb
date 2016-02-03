# frozen_string_literal: true
FactoryGirl.define do
  factory :course_group_user, class: Course::GroupUser.name do
    transient do
      course { build(:course) }
    end

    course_group { build(:course_group, course: course) }
    user { create(:course_user, :approved, course: course_group.course).user }
    role :normal

    factory :course_group_student
    factory :course_group_manager do
      role :manager
    end
  end
end
