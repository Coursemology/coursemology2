# frozen_string_literal: true
FactoryBot.define do
  factory :course_video_watch_interval, class: Course::Video::WatchInterval.name,
                                        aliases: [:video_watch_interval] do
    transient do
      course { build(:course, :with_video_component_enabled) }
      video { build(:video, :published, course: course) }
      student { build(:course_student, course: course) }
    end

    submission do
      build(:video_submission, video: video, creator: student.user, course_user: student)
    end

    creator { build(:course_student, course: course).user }
    updater { creator }

    video_start 0
    video_end 100
    end_recorded_at Time.zone.now
  end
end
