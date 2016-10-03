# frozen_string_literal: true
FactoryGirl.define do
  factory :course_lesson_plan_todo, class: Course::LessonPlan::Todo.name, aliases: [:todo] do
    transient do
      course { create(:course) }
      draft false
    end
    item { create(:course_lesson_plan_item, course: course, base_exp: 1000, draft: draft) }
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

    after(:build) do |_todo, evaluator|
      course_user = CourseUser.where(course: evaluator.course, user: evaluator.user)
      create(:course_user, :approved, course: evaluator.course) if course_user.blank?
    end
  end
end
