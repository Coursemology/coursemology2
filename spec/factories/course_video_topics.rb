# frozen_string_literal: true
FactoryBot.define do
  factory :course_video_topic, class: Course::Video::Topic.name,
                               parent: :course_discussion_topic,
                               aliases: [:video_topic] do
    course { create(:course) }
    video { build(:video, course: course) }
    creator { build(:course_student, course: course).user }
    updater { creator }
    timestamp { 5 }
    posts { [build(:course_discussion_post, creator: creator, updater: updater)] }

    trait :with_submission do
      after(:build) do |topic|
        topic.video.submissions =
          [build(:course_video_submission, video: topic.video, creator: topic.creator)]
      end
    end
  end
end
