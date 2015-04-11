FactoryGirl.define do
  factory :course_lesson_plan_item, class: 'Course::LessonPlanItem' do
    creator
    updater
    base_exp 100
    time_bonus_exp 100
    extra_bonus_exp 100
    start_time 1.days.from_now
    bonus_cutoff_time 2.days.from_now
    end_time 3.days.from_now
  end
end
