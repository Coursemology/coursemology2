FactoryGirl.define do
  factory :course_lesson_plan_item, class: Course::LessonPlan::Item.name do
    course
    base_exp          { rand(1..10) * 100 }
    time_bonus_exp    { rand(1..10) * 100 }
    extra_bonus_exp   { rand(1..10) * 100 }
    start_at 1.days.from_now
    bonus_end_at 2.days.from_now
    end_at 3.days.from_now
    sequence(:title) { |n| "Example Lesson Plan Item #{n}" }
  end
end
