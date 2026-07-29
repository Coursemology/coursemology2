# frozen_string_literal: true
# The immutable snapshot store: one row per published version, each pointing at a copy of the
# assessment held in the `preview` container course.
#
# The listings and adoptions tables declare their versioning columns directly rather than being
# altered here — the whole marketplace reaches master in one release, so there is nothing deployed
# to retrofit.
class AddMarketplaceVersioningAndPreviewContainer < ActiveRecord::Migration[7.2]
  def change
    create_versions_table
    # Deferred out of the listings migration: listings and versions reference each other, so the
    # second direction can only be added once both tables exist.
    add_foreign_key :course_assessment_marketplace_listings,
                    :course_assessment_marketplace_listing_versions,
                    column: :current_version_id, name: 'fk_caml_current_version_id',
                    on_delete: :nullify
    # Marks the single container course holding every snapshot. Marketplace behaviour keys off this
    # flag, never off a specific instance id.
    add_column :courses, :preview, :boolean, default: false, null: false
  end

  private

  def create_versions_table
    create_table :course_assessment_marketplace_listing_versions do |t|
      t.references :listing, null: false,
                             foreign_key: { to_table: :course_assessment_marketplace_listings,
                                            name: 'fk_camlv_listing_id',
                                            on_delete: :cascade },
                             index: { name: 'fk__camlv_listing_id' }
      # A version IS its publication datetime. There is no ordinal: an
      # integer would name a series the system cannot navigate — there is no rollback — and the
      # stable internal referent is already this row's primary key.
      t.datetime :published_at, null: false
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
    add_index :course_assessment_marketplace_listing_versions, [:listing_id, :published_at],
              unique: true, name: 'index_camlv_on_listing_id_and_published_at'
  end
end
