# frozen_string_literal: true
FactoryGirl.define do
  factory :course_material, class: Course::Material.name, aliases: [:material] do
    folder
    sequence(:name) { |n| "Material #{n}" }
    sequence(:description) { |n| "Material Description #{n}" }
    attachment
  end
end
