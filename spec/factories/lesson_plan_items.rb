# spec/factories/lesson_plan_items.rb
FactoryBot.define do
  factory :lesson_plan_item, class: 'Course::LessonPlan::Item' do
    association :course
    title { 'Sample Lesson Plan Item' }
    start_at { Time.now }
    end_at { Time.now + 1.hour }
  end
end
