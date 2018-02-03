# frozen_string_literal: true
class CreateMaterials < ActiveRecord::Migration[4.2]
  def change
    create_table :course_material_folders do |t|
      t.references :parent_folder, foreign_key: { references: :course_material_folders }
      t.references :owner, polymorphic: true
      t.string :name, null: false
      t.text :description
      t.datetime :start_at, null: false
      t.datetime :end_at

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    create_table :course_materials do |t|
      t.references :folder, null: false, foreign_key: { references: :course_material_folders }
      t.string :name, null: false
      t.text :description

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end
  end
end
