# frozen_string_literal: true
FactoryBot.define do
  factory :course_video_submission, class: Course::Video::Submission.name,
                                    aliases: [:video_submission],
                                    parent: :course_experience_points_record do
    transient do
      course
    end

    video { build(:video, course: course) }
    creator { build(:course_student, course: course).user }
  end
end
