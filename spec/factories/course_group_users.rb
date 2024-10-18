# spec/factories/course_group_users.rb
FactoryBot.define do
  factory :course_group_user, class: Course::GroupUser.name do
    transient do
      course { create(:course) }
    end

    group { create(:course_group, course: course) }
    course_user { create(:course_user, course: course) }
    creator { create(:user) }
    updater { create(:user) }
    role { :normal }

    factory :course_group_student do
      role { :normal }
    end

    factory :course_group_manager do
      role { :manager }
    end
  end
end
