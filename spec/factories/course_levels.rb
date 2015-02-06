FactoryGirl.define do
  factory :course_level, class: 'Course::Level' do
    course
    sequence(:exp_threshold)
  end
end
