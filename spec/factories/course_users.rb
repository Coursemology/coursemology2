FactoryGirl.define do
  factory :course_user do
    user
    course
    role :student
    name 'student'
    phantom false
  end
end
