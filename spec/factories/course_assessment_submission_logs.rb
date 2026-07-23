# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_submission_log, class: Course::Assessment::Submission::Log do
    transient do
      course { build(:course) }
      assessment { build(:assessment, course: course) }
    end

    # `Log#submission` targets the base `Course::Assessment::Attempt` (not the `Submission` detail
    # extension), so this association must be given an Attempt or FactoryBot's lint raises
    # `ActiveRecord::AssociationTypeMismatch`. Build through `:submission` (rather than a bare
    # `:attempt`) so the Attempt gets a valid creator/course-user graph its validations require.
    submission { build(:submission, assessment: assessment, course: course).attempt }
    request do
      {
        HTTP_X_FORWARDED_FOR: '192.168.123.45',
        HTTP_USER_AGENT: 'Internet Explorer',
        USER_SESSION_ID: SecureRandom.hex(8),
        SUBMISSION_SESSION_ID: SecureRandom.hex(8)
      }.to_json
    end
  end
end
