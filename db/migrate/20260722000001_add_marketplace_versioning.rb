# frozen_string_literal: true
class AddMarketplaceVersioning < ActiveRecord::Migration[7.2]
  def change
    create_table :course_assessment_marketplace_listing_versions do |t|
      t.references :listing, null: false,
                             foreign_key: { to_table: :course_assessment_marketplace_listings,
                                            name: 'fk_camlv_listing_id',
                                            on_delete: :cascade },
                             index: { name: 'fk__camlv_listing_id' }
      t.integer :version, null: false
      t.references :assessment, null: false,
                                foreign_key: { to_table: :course_assessments,
                                               name: 'fk_camlv_assessment_id' },
                                index: { name: 'fk__camlv_assessment_id' }
      t.references :published_by, null: false,
                                  foreign_key: { to_table: :users, name: 'fk_camlv_published_by' },
                                  index: { name: 'fk__camlv_published_by' }
      t.references :creator, null: false,
                            foreign_key: { to_table: :users, name: 'fk_camlv_creator_id' },
                            index: { name: 'fk__camlv_creator_id' }
      t.references :updater, null: false,
                            foreign_key: { to_table: :users, name: 'fk_camlv_updater_id' },
                            index: { name: 'fk__camlv_updater_id' }
      t.timestamps null: false
    end
    add_index :course_assessment_marketplace_listing_versions, [:listing_id, :version],
              unique: true, name: 'index_camlv_on_listing_id_and_version'

    change_table :course_assessment_marketplace_listings, bulk: true do |t|
      t.references :current_version, null: true,
                                     foreign_key: { to_table: :course_assessment_marketplace_listing_versions,
                                                    name: 'fk_caml_current_version_id',
                                                    on_delete: :nullify },
                                     index: { name: 'fk__caml_current_version_id' }
      t.references :source_course, null: true,
                                   foreign_key: { to_table: :courses,
                                                  name: 'fk_caml_source_course_id',
                                                  on_delete: :nullify },
                                   index: { name: 'fk__caml_source_course_id' }
      t.string :source_course_name
      t.string :source_course_code
      t.string :source_academic_period
      t.references :fallback_maintainer, null: true,
                                         foreign_key: { to_table: :users,
                                                        name: 'fk_caml_fallback_maintainer_id' },
                                         index: { name: 'fk__caml_fallback_maintainer_id' }
    end

    change_table :course_assessment_marketplace_adoptions, bulk: true do |t|
      t.integer :adopted_version
      t.integer :dismissed_version
      t.boolean :reminders_muted, null: false, default: false
    end
  end
end
