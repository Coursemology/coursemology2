# frozen_string_literal: true
json.partial! 'course/video/topics/topics', locals: { topics: @topics }
json.partial! 'course/video/topics/posts', locals: { posts: @posts }
