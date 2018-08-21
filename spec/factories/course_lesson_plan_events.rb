# frozen_string_literal: true
FactoryBot.define do
  factory :course_lesson_plan_event, class: Course::LessonPlan::Event.name,
                                     parent: :course_lesson_plan_item do
    sequence(:title) { |n| "Example Course Event #{n}" }
    description { 'Funky description' }
    event_type { 'Face-to-face Meetup' }
    location { 'Cool location' }
  end
end
