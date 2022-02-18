class CreateCourseMaterialDownloads < ActiveRecord::Migration[6.0]
  def change
    create_table :course_material_downloads do |t|
      t.integer :course_user_id, references: :course_users, null: false,
                                 index: true, foreign_key: true
      t.integer :material_id, references: :course_materials, null: false,
                              index: true, foreign_key: true
      t.timestamps
    end

    # Custom index name provided since the default name is too long
    add_index :course_material_downloads, [:course_user_id, :material_id], unique: true,
                                          name: :index_downloads_on_course_user_and_materials
  end
end
