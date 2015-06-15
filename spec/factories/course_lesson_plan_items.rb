FactoryGirl.define do
  factory :course_lesson_plan_item, class: 'Course::LessonPlanItem' do
    creator
    updater
    course
    base_exp          { rand(1..10) * 100 }
    time_bonus_exp    { rand(1..10) * 100 }
    extra_bonus_exp   { rand(1..10) * 100 }
    start_time 1.days.from_now
    bonus_end_time 2.days.from_now
    end_time 3.days.from_now
    sequence(:title) { |n| "Example Lesson Plan Item #{n}" }
  end
end
