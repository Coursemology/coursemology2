# frozen_string_literal: true
FactoryBot.define do
  factory :course_forum_rag_wise_rating, class: 'Course::Forum::RagWiseRating' do
    association :post, factory: :course_discussion_post
    creator
    updater
    original_content { 'Generated answer' }
    faithfulness_score { 0.5 }
    answer_relevance_score { 0.5 }
  end
end
