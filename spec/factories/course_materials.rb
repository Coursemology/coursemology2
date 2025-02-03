# frozen_string_literal: true
FactoryBot.define do
  factory :course_material, class: Course::Material.name, aliases: [:material] do
    folder
    sequence(:name) { |n| "Material #{n}" }
    sequence(:description) { |n| "Material Description #{n}" }
    attachment_reference

    trait :not_chunked do
      workflow_state { 'not_chunked' }
    end

    trait :chunking do
      workflow_state { 'chunking' }
    end

    trait :chunked do
      workflow_state { 'chunked' }
    end
  end
end
