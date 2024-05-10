# frozen_string_literal: true
FactoryBot.define do
  factory :course_discussion_post_codaveri_feedback, class: 'Course::Discussion::Post::CodaveriFeedback' do
    association :post, factory: :course_discussion_post
    codaveri_feedback_id { '12345abcde' }
    original_feedback { 'Some feedback' }
    status { :pending_review }

    trait :accepted do
      status { :accepted }
    end
  end
end
