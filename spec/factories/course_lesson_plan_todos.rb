# frozen_string_literal: true
FactoryBot.define do
  factory :course_lesson_plan_todo, class: Course::LessonPlan::Todo.name, aliases: [:todo] do
    transient do
      course { create(:course) }
      published false
    end
    item { create(:course_lesson_plan_item, course: course, base_exp: 1000, published: published) }
    add_attribute(:ignore) { false }
    user

    trait :not_started do
      # Default according to workflow defined, no action required.
    end

    trait :in_progress do
      workflow_state :started
    end

    trait :completed do
      workflow_state :completed
    end

    trait :not_opened do
      after(:build) do |todo|
        todo.item.start_at = 2.days.from_now
        todo.item.save!
      end
    end

    trait :opened do
      after(:build) do |todo|
        todo.item.start_at = 2.days.ago
        todo.item.save!
      end
    end

    after(:build) do |_todo, evaluator|
      course_user = CourseUser.find_by(course: evaluator.course, user: evaluator.user)
      create(:course_user, course: evaluator.course) unless course_user
    end
  end
end
