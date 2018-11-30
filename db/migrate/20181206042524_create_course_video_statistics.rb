# frozen_string_literal: true
class CreateCourseVideoStatistics < ActiveRecord::Migration[5.2]
  def change
    create_table :course_video_statistics do |t|
      t.references :cacheable, polymorphic: true, index: { name: 'cacheable_index' }
      t.string  :cacheable_type
      t.integer :cacheable_id
      t.integer :watch_freq, array: true, default: []
      t.integer :percent_watched, default: 0, null: false
    end
    add_column :course_videos, :workflow_state, :string, null: false, default: 'uncached'
  end
end
