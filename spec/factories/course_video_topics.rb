# frozen_string_literal: true
FactoryGirl.define do
  factory :course_video_topic, class: Course::Video::Topic.name,
                               parent: :course_discussion_topic,
                               aliases: [:video_topic] do
    transient do
      creator { build(:course_student, course: course).user }
    end

    course { create(:course) }
    video { build(:video, course: course) }
    timestamp 5
    posts { [build(:course_discussion_post, creator: creator, updater: creator)] }
  end
end
