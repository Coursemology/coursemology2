# frozen_string_literal: true
class ConvertVideoPostsToPlainText < ActiveRecord::Migration[5.1]
  def up
    Course::Discussion::Post.
      joins(:topic).
      where(course_discussion_topics: { actable_type: Course::Video::Topic.name }).
      find_each do |post|
      post_text = post.text.
                  gsub('<p>', '').
                  gsub('</p>', "\n").
                  gsub('<br>', "\n").
                  gsub('<br />', "\n").
                  strip

      next if post_text.empty?
      sanitized_text = Sanitize.
                       fragment(post_text, Sanitize::Config::BASIC).
                       strip.
                       encode(universal_newline: true)

      post.update_column(:text, sanitized_text)
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
