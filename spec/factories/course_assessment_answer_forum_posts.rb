# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_answer_forum_post, class: Course::Assessment::Answer::ForumPost do
    transient do
      course { build(:course) }
      creator { create(:course_student, course: course) }
      parent { nil }
      topic { parent&.topic || create(:forum_topic, course: course) }
      post { create(:course_discussion_post, parent: parent, topic: topic, creator: creator.user) }
    end

    answer { build(:course_assessment_answer_forum_post_response) }
    forum_topic_id { topic.id }
    post_id { post.id }
    post_text { post.text }
    post_creator_id { post.creator.id }
    post_updated_at { post.updated_at }
    parent_id { parent&.id }
    parent_text { parent&.text }
    parent_creator_id { parent&.creator&.id }
    parent_updated_at { parent&.updated_at }
  end
end
