# frozen_string_literal: true
class CreateGradebookLevelConfigs < ActiveRecord::Migration[7.2]
  def change
    create_table :course_gradebook_level_configs do |t|
      t.references :course, null: false,
                            foreign_key: { to_table: :courses, on_delete: :cascade },
                            index: {
                              unique: true,
                              name: 'index_course_gradebook_level_configs_on_course_id'
                            }

      t.boolean :enabled, null: false, default: false
      t.string :formula, null: false, default: ''
      t.jsonb :formula_ast
      t.decimal :weight, precision: 5, scale: 2, null: false, default: 0
      t.boolean :show, null: false, default: false
      t.boolean :clamp, null: false, default: true

      t.references :creator, null: false,
                             foreign_key: { to_table: :users },
                             index: { name: 'fk__course_gradebook_level_configs_creator_id' }

      t.references :updater, null: false,
                             foreign_key: { to_table: :users },
                             index: { name: 'fk__course_gradebook_level_configs_updater_id' }

      t.timestamps null: false
    end
  end
end
