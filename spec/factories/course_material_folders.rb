# frozen_string_literal: true
FactoryBot.define do
  factory :course_material_folder, class: Course::Material::Folder.name, aliases: [:folder] do
    course
    sequence(:name) { |n| "Folder #{n}" }
    sequence(:description) { |n| "Folder Description #{n}" }
    start_at Time.zone.now
    end_at 3.days.from_now

    trait :not_started do
      start_at { 1.day.from_now }
      end_at { 3.days.from_now }
    end

    trait :ended do
      start_at { 1.week.ago }
      end_at { 1.day.ago }
    end
  end
end
