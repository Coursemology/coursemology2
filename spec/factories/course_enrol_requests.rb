FactoryGirl.define do
  factory :course_enrol_request, :class => 'Course::EnrolRequest' do
    course
    creator
    updater
    user
    role :student

    factory :student_enrol_request, parent: :course_enrol_request

    factory :teaching_assistant_enrol_request, parent: :course_enrol_request do
      role :teaching_assistant
    end

    factory :manager_enrol_request, parent: :course_enrol_request do
      role :manager
    end

    factory :owner_enrol_request, parent: :course_enrol_request do
      role :owner
    end
  end
end
