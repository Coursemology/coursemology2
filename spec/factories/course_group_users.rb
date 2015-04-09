FactoryGirl.define do
  factory :course_group_user, class: Course::GroupUser.name do
    course_group
    user
    role :normal
    creator
    updater

    factory :course_group_student
    factory :course_group_manager do
      role :manager
    end
  end
end
