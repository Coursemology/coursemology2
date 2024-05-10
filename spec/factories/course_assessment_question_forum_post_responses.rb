# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_question_forum_post_response,
          class: 'Course::Assessment::Question::ForumPostResponse',
          parent: :course_assessment_question do
    has_text_response { true }
    max_posts { 1 }
  end
end
