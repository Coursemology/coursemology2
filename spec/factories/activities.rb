# frozen_string_literal: true
FactoryBot.define do
  factory :activity do
    actor
    object { create(:user) }
    event { 'test' }
    notifier_type { 'test_notifier' }

    trait :achievement_gained do
      object { create(:course_achievement) }
      event { :gained }
      notifier_type { 'Course::AchievementNotifier' }
    end

    trait :assessment_attempted do
      object { create(:assessment) }
      event { :attempted }
      notifier_type { 'Course::AssessmentNotifier' }
    end

    trait :level_reached do
      object { create(:course_level) }
      event { :reached }
      notifier_type { 'Course::LevelNotifier' }
    end

    trait :forum_topic_created do
      object { create(:forum_topic) }
      event { :created }
      notifier_type { 'Course::Forum::TopicNotifier' }
    end

    trait :forum_post_replied do
      object do
        topic = create(:forum_topic)
        create(:course_discussion_post, topic: topic.acting_as)
      end
      event { :replied }
      notifier_type { 'Course::Forum::PostNotifier' }
    end

    trait :video_attempted do
      object { create(:video) }
      event { :attempted }
      notifier_type { 'Course::VideoNotifier' }
    end
  end
end
