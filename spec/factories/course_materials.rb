# frozen_string_literal: true
FactoryBot.define do
  factory :course_material, class: 'Course::Material', aliases: [:material] do
    folder
    sequence(:name) { |n| "Material #{n}" }
    sequence(:description) { |n| "Material Description #{n}" }
    attachment_reference
  end
end
