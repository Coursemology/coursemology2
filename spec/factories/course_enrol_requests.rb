FactoryGirl.define do
  factory :course_enrol_request, :class => 'Course::EnrolRequest' do
    course
    creator
    updater
    user
    role :student
  end
end
