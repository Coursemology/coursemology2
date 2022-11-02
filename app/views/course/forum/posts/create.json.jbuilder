# frozen_string_literal: true

json.post do
  json.partial! 'post_list_data', post: @post
end

json.postTreeIds @topic.posts.ordered_topologically.sorted_ids
