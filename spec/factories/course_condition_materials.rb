# frozen_string_literal: true
FactoryBot.define do
  factory :course_condition_material,
          class: Course::Condition::Material.name, aliases: [:material_condition] do
    course
    material
    association :conditional, factory: :course_material
  end
end
