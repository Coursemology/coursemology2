# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_live_feedback_thread, class: Course::Assessment::LiveFeedback::Thread,
                                                   aliases: [:live_feedback_thread] do
    transient do
      course { create(:course) }
      user { create(:course_student, course: course).user }
      assessment { create(:assessment, :published_with_programming_question, course: course) }
      submission { create(:submission, :attempting, assessment: assessment, creator: user) }
      question { assessment.questions.where(actable_type: 'Course::Assessment::Question::Programming').first }
    end

    submission_question { create(:submission_question, submission: submission, question: question) }
    submission_creator_id { user.id }
    is_active { true }
    codaveri_thread_id { SecureRandom.hex(12) }
    created_at { Time.zone.now }
  end
end
