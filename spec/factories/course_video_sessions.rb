# frozen_string_literal: true
FactoryBot.define do
  factory :course_video_session, class: Course::Video::Session.name,
                                 aliases: [:video_session] do
    transient do
      course { build(:course, :with_video_component_enabled) }
      video { build(:video, :published, course: course) }
      student { create(:course_student, course: course) }
    end

    submission do
      build(:video_submission, video: video, creator: student.user, course_user: student)
    end

    creator { student.user }
    updater { creator }

    session_start Time.zone.now - 5.minutes
    session_end Time.zone.now + 5.minutes

    trait :with_events do
      after(:build) do |session|
        session.events = (1..5).map { |n| build(:video_event, sequence_num: n) }
      end
    end
  end
end
