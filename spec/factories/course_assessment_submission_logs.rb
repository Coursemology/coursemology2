# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_submission_log, class: Course::Assessment::Submission::Log do
    transient do
      course { build(:course) }
      assessment { build(:assessment, course: course) }
    end

    submission { build(:submission, assessment: assessment, course: course) }
    request do
      {
        'REMOTE_ADDR': '192.168.123.45',
        'HTTP_USER_AGENT': 'Internet Explorer',
        'USER_SESSION_ID': SecureRandom.hex(8),
        'SUBMISSION_SESSION_ID': SecureRandom.hex(8)
      }.to_json
    end
  end
end
