# frozen_string_literal: true
class CreateCourseVideoTabs < ActiveRecord::Migration[5.1]
  def change
    create_table :course_video_tabs do |t|
      t.references :course, null: false,
                            type: :integer,
                            foreign_key: { to_table: :courses }
      t.string :title, null: false, limit: 255
      t.integer :weight, null: false

      t.timestamps
    end

    add_reference :course_video_tabs,
                  :creator,
                  references: :users,
                  type: :integer,
                  null: false,
                  foreign_key: { to_table: :users }
    add_reference :course_video_tabs,
                  :updater,
                  references: :users,
                  type: :integer,
                  null: false,
                  foreign_key: { to_table: :users }

    ActsAsTenant.without_tenant do
      Course.find_each do |course|
        course.video_tabs.create(title: 'Default', weight: 0,
                                 creator_id: course.creator.id, updater_id: course.creator.id)
      end
    end
  end
end
