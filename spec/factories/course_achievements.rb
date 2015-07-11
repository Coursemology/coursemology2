FactoryGirl.define do
  factory :course_achievement, class: Course::Achievement.name, aliases: [:achievement] do
    course
    sequence(:title)  { |n| "Achievement #{n}" }
    sequence(:description) { |n| "Awesome achievement #{n}" }
    sequence(:weight)
    published true
  end
end
