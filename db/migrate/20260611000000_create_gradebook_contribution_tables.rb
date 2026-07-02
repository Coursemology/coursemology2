# frozen_string_literal: true
class CreateGradebookContributionTables < ActiveRecord::Migration[7.2]
  def change
    create_table :course_gradebook_tab_contributions do |t|
      t.references :course, null: false, foreign_key: { to_table: :courses },
                            index: { name: 'fk__course_gradebook_tab_contributions_course_id' }
      t.references :tab, null: false,
                         foreign_key: { to_table: :course_assessment_tabs, on_delete: :cascade },
                         index: { unique: true,
                                  name: 'index_course_gradebook_tab_contributions_on_tab_id' }
      t.decimal :weight, precision: 5, scale: 2, null: false, default: 0
      t.integer :weight_mode, null: false, default: 0

      t.references :creator, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__course_gradebook_tab_contributions_creator_id' }
      t.references :updater, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__course_gradebook_tab_contributions_updater_id' }
      t.timestamps null: false
    end

    create_table :course_gradebook_assessment_contributions do |t|
      t.references :assessment, null: false,
                                foreign_key: { to_table: :course_assessments, on_delete: :cascade },
                                index: { unique: true,
                                         name: 'index_cgac_on_assessment_id' }
      t.decimal :weight, precision: 5, scale: 2, null: true
      t.boolean :excluded, null: false, default: false

      t.references :creator, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__cgac_creator_id' }
      t.references :updater, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__cgac_updater_id' }
      t.timestamps null: false
    end
  end
end
