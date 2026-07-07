# frozen_string_literal: true
# Intrinsic provider: the forum thread lives on the consumer's OWN forum-post answer. Returns the root
# (opening) post of each forum topic the student's selected posts belong to -- the discussion prompt they are
# responding to -- which is the context a grader wants alongside the student's replies.
class Course::Assessment::Question::GradingContext::ForumThreadProvider <
  Course::Assessment::Question::GradingContext::Provider
  def context_text(context, submission)
    answer = submission.answers.current_answers.find_by(question_id: context.question_id)&.specific
    return nil unless answer.respond_to?(:post_packs)

    topic_ids = answer.post_packs.map(&:forum_topic_id).compact.uniq
    roots = topic_ids.filter_map { |topic_id| thread_root_text(topic_id) }
    roots.uniq.join("\n\n").presence
  end

  private

  # The topic's root post is its earliest published post with no parent (acts_as_forest tree root).
  def thread_root_text(topic_id)
    topic = Course::Forum::Topic.find_by(id: topic_id)
    return nil unless topic

    root_post = topic.acting_as.posts.only_published_posts.find_by(parent_id: nil)
    root_post&.text.presence
  end
end
