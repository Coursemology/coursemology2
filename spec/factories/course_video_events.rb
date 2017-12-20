# frozen_string_literal: true
FactoryBot.define do
  factory :course_video_event, class: Course::Video::Event.name,
                               aliases: [:video_event] do
    transient do
      course { build(:course, :with_video_component_enabled) }
      video { build(:video, :published, course: course) }
      student { create(:course_student, course: course) }
      submission do
        build(:video_submission, video: video, creator: student.user, course_user: student)
      end
    end

    session do
      build(:video_session, video: video, creator: student.user, student: student,
                            submission: submission)
    end

    event_type 'pause'
    sequence_num 1
    video_time_initial 20
    video_time_final nil
    event_time Time.zone.now
  end
end
