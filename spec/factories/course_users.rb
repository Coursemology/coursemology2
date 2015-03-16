FactoryGirl.define do
  factory :course_user do
    user
    course
    phantom false
    role :student
    name 'default'

    factory :course_student, parent: :course_user do
      name 'student'
    end

    factory :course_teaching_assistant, parent: :course_user do
      role :teaching_assistant
      name 'teaching assistant'
    end

    factory :course_manager, parent: :course_user do
      role :manager
      name 'manager'
    end

    factory :course_owner, parent: :course_user do
      role :owner
      name 'owner'
    end
  end
end
