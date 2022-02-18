class CreateCourseTagRelationships < ActiveRecord::Migration[6.0]
  def change
    create_table :course_tag_relationships do |t|
      t.integer :tag_id, references: :course_tags, null: false,
                         index: true, foreign_key: true
      t.integer :child_tag_id, references: :course_tags, null: false,
                               index: true, foreign_key: true
    end
  end
end
