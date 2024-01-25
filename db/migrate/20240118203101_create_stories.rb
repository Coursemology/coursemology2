# frozen_string_literal: true
class CreateStories < ActiveRecord::Migration[6.0]
  def change
    create_table :course_stories do |t|
      t.string :provider_id, null: false
      t.integer :satisfiability_type, default: 0

      # For some reason, t.userstamps does not work
      t.references :creator, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__course_stories_creator_id' }
      t.references :updater, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__course_stories_updater_id' }
      t.timestamps null: false
    end

    create_table :course_story_rooms do |t|
      t.references :story, null: false, index: true, foreign_key: { to_table: :course_stories }
      t.provided_room_id :string
      t.datetime :completed_at

      # For some reason, t.userstamps does not work
      t.references :creator, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__course_story_rooms_creator_id' }
      t.references :updater, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__course_story_rooms_updater_id' }
      t.timestamps null: false
    end
  end
end
