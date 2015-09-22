FactoryGirl.define do
  factory :forum, class: Course::Forum.name do
    course
    name 'test forum'
    description 'This is the test forum'
  end
end
