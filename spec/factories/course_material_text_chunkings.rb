# frozen_string_literal: true
FactoryBot.define do
  factory :course_material_text_chunking, class: Course::Material::TextChunking.name, aliases: [:text_chunking] do
    material
    trait :no_chunking do
      material { build(:material, :not_chunked) }
    end
    trait :chunking do
      material { build(:material, :chunking) }
      job { build(:trackable_job) }
    end
  end
end
