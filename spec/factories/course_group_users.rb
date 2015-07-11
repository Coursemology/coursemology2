FactoryGirl.define do
  factory :course_group_user, class: Course::GroupUser.name do
    course_group
    user
    role :normal

    after(:build) do |group_user|
      course = group_user.course_group.course
      user = group_user.user
      create(:course_user, course: course, user: user) unless user.courses.include?(course)
    end

    factory :course_group_student
    factory :course_group_manager do
      role :manager
    end
  end
end
