# frozen_string_literal: true
FactoryBot.define do
  factory :duplication_traceable_lesson_plan_items, class: DuplicationTraceable::LessonPlanItem.name do
    source { build(:lesson_plan_item) }
    lesson_plan_item
  end
end
