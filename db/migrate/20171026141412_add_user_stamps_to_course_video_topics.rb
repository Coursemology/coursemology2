class AddUserStampsToCourseVideoTopics < ActiveRecord::Migration[5.0]
  def change
    add_reference :course_video_topics,
                  :creator,
                  references: :users,
                  foreign_key: { to_table: :users }
    add_reference :course_video_topics,
                  :updater,
                  references: :users,
                  foreign_key: { to_table: :users }

    Course::Video::Topic.reset_column_information
    infer_topic_creator

    change_column :course_video_topics, :creator_id, :integer, null: false
    change_column :course_video_topics, :updater_id, :integer, null: false
  end

  def infer_topic_creator
    ActsAsTenant.without_tenant do
      Course::Video::Topic.all.each do |topic|
        posts = topic.acting_as.posts

        if posts.empty?
          topic.destroy!
          next
        end

        creator_id = posts.ordered_topologically.first.first.creator_id
        updater_id = posts.ordered_topologically.first.first.updater_id

        topic.creator_id = creator_id
        topic.updater_id = updater_id
        topic.save!
      end
    end
  end
end
