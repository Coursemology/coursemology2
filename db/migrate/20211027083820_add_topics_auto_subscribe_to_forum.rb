class AddTopicsAutoSubscribeToForum < ActiveRecord::Migration[6.0]
  def change
    add_column :course_forums, :forum_topics_auto_subscribe, :boolean, default: true, null: false
  end
end
