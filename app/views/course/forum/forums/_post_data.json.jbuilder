# frozen_string_literal: true

topic = post.topic.specific

json.id post.id
json.title topic.title
json.topicSlug topic.slug
json.forumSlug topic.forum.slug
json.content format_ckeditor_rich_text(post.text)
json.voteTally post.vote_tally
json.createdAt post.created_at
