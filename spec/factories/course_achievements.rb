# frozen_string_literal: true
FactoryBot.define do
  factory :course_achievement, class: Course::Achievement.name, aliases: [:achievement] do
    course
    sequence(:title) { |n| "Achievement #{n}" }
    sequence(:description) { |n| "Awesome achievement #{n}" }
    sequence(:weight)
    published { true }

    trait :with_badge do
      badge { Rack::Test::UploadedFile.new(File.join(Rails.root, 'spec', 'support', 'minion.png')) }
    end

    trait :with_missing_badge do
      badge { Rack::Test::UploadedFile.new(File.join(Rails.root, 'spec', 'support', 'minion.png')) }
      after(:create) do |achievement|
        badge_folder = Rails.root.join('public', 'uploads', 'images', 'course',
                                       'achievement', achievement.id.to_s)
        FileUtils.rm_rf(badge_folder)
      end
    end

    trait :with_level_condition do
      after(:build) do |achievement|
        create(:level_condition, course: achievement.course, conditional: achievement)
      end
    end
  end
end
