# frozen_string_literal: true
FactoryGirl.define do
  factory :course_assessment_submission_question, class: Course::Assessment::SubmissionQuestion,
                                                  parent: :course_discussion_topic,
                                                  aliases: [:submission_question] do
    transient do
      course { create(:course) }
      # submission must be created by a student enrolled in the course for the todo items to be
      # updated correctly.
      user { create(:course_student, course: course).user }
      assessment { create(:assessment, :published_with_programming_question, course: course) }
    end

    submission { create(:submission, :attempting, assessment: assessment, creator: user) }
    question { assessment.questions.first }
  end
end
