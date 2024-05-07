# frozen_string_literal: true
FactoryBot.define do
  factory :course_assessment_answer_forum_post, class: 'Course::Assessment::Answer::ForumPost' do
    # TODO: Look into streamlining some of these closely knitted relationships among the
    # transient objects. It might be a bit too complex, making it hard to use while testing
    # without some inconsistencies, e.g. parent post and child post end up in different courses, etc.
    transient do
      parent { nil }
      course { parent&.topic&.course || build(:course) }
      creator { create(:course_student, course: course) }
      # Pass in a Course::Discussion::Topic instead of Course::Forum::Topic
      topic { parent&.topic || create(:forum_topic, course: course).acting_as }
      post { create(:course_discussion_post, parent: parent, topic: topic, creator: creator.user) }
    end

    answer { build(:course_assessment_answer_forum_post_response) }
    # We want the Course::Forum::Topic id here
    forum_topic_id { topic.actable.id }
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
