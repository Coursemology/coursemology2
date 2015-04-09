FactoryGirl.define do
  factory :course_group, class: Course::Group.name do
    course
    sequence(:name)  { |n| "Group #{n}" }
    creator
    updater
  end
end
