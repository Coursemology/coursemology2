# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_answer_forum_post_response,
          class: 'Course::Assessment::Answer::ForumPostResponse',
          parent: :course_assessment_answer do
    transient do
      question_traits { nil }
      post_pack_count { 1 }
    end

    question do
      build(:course_assessment_question_forum_post_response, *question_traits,
            assessment: assessment).question
    end

    answer_text { '<p>xxx</p>' }

    trait :with_posts do
      after(:build) do |answer, evaluator|
        [evaluator.post_pack_count, 1].max.downto(1).map do
          post_pack = build(:course_assessment_answer_forum_post, answer: answer)
          answer.post_packs << post_pack
        end
      end
    end
  end
end
