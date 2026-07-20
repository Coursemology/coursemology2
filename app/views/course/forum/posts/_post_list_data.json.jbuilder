# frozen_string_literal: true

json.id post.id
json.topicId topic.id
json.parentId post.parent_id
json.postUrl course_forum_topic_post_path(current_course, forum, topic, post)
json.text format_ckeditor_rich_text(post.text)
json.createdAt post.created_at
json.isAnswer post.answer
json.isUnread post.unread?(current_user)
json.hasUserVoted !post.vote_for(current_user).nil?
json.userVoteFlag post.vote_for(current_user)&.vote_flag?
json.voteTally post.vote_tally
json.workflowState post.workflow_state
json.isAiGenerated post.is_ai_generated

# Lazily backfills the rating for pre-feature (or straggler) AI drafts so they render with the rateable card.
post.ensure_generated_rating! if post.is_ai_generated && post.workflow_state == 'draft'
rag_wise_rating = post.is_ai_generated ? post.rag_wise_rating : nil
if rag_wise_rating
  json.generatedRating do
    # `type` discriminates which rating endpoint the client should call (see RateableGeneratedCommentCard).
    json.type 'rag_wise'
    json.id rag_wise_rating.id
    json.rating rag_wise_rating.rating
    json.originalContent rag_wise_rating.original_content
    json.editedContent rag_wise_rating.edited_content
    json.faithfulnessScore rag_wise_rating.faithfulness_score
    json.answerRelevanceScore rag_wise_rating.answer_relevance_score
  end
end

json.partial! 'course/forum/posts/post_creator_data', post: post

json.permissions do
  json.canEditPost can?(:edit, post)
  json.canDeletePost can?(:destroy, post)
  json.canReplyPost can?(:reply, topic)
  json.canViewAnonymous can?(:view_anonymous, post)
  json.isAnonymousEnabled current_course.settings(:course_forums_component).allow_anonymous_post
end
