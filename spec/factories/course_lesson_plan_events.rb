# frozen_string_literal: true
FactoryGirl.define do
  factory :course_lesson_plan_event, class: Course::LessonPlan::Event.name,
                                     parent: :course_lesson_plan_item do
    sequence(:title) { |n| "Example Course Event #{n}" }
    description 'Funky description'
    location 'Cool location'

    factory :recitation do
      event_type :recitation
      sequence(:title) { |n| "Example Recitation #{n}" }
    end

    factory :tutorial do
      event_type :tutorial
      sequence(:title) { |n| "Example Tutorial #{n}" }
    end

    factory :lecture do
      event_type :lecture
      sequence(:title) { |n| "Example Lecture #{n}" }
    end
  end
end
