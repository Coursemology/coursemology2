FactoryGirl.define do
  factory :course_user do
    user
    course
    name 'student'
    role :student
    phantom false
  end
end
