# frozen_string_literal: true

json.id @search.course_user.id
json.name @search.course_user.name

unless @search.posts.empty?
  json.userPosts @search.posts.each do |post|
    json.partial! 'post_data', post: post
  end
end
