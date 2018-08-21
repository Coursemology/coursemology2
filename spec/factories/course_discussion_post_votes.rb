# frozen_string_literal: true
FactoryBot.define do
  factory :course_discussion_post_vote, class: Course::Discussion::Post::Vote.name do
    association :post, factory: :course_discussion_post
    vote_flag { true }
    creator
    updater
  end
end
