class CreateCourseTags < ActiveRecord::Migration[6.0]
  def change
    create_table :course_tags do |t|
      t.references :course, null: false, foreign_key: { references: :courses }
      t.text :title, null: false
      t.text :description
      t.timestamps
    end
  end
end
