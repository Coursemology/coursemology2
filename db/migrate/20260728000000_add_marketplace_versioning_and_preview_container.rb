# frozen_string_literal: true
# Marketplace versioning in one migration: the marketplace stops
# serving live source content and serves an immutable snapshot held in the preview container course.
#
# Deliberately one migration, not a schema/data pair per slice. The data backfill calls application
# code (`PublishService.backfill_all!`), which always reflects this branch's final schema, so the
# rename and `courses.preview` must already have run. Split across separate timestamps, a from-scratch
# `db:migrate` died on `PG::UndefinedColumn` — only `db:schema:load` masked it.
#
# Fold a further schema change on this branch into the schema group, never after the backfills. The
# cost is that any DB which already ran this migration must be rebuilt from the template under a fresh
# tag; that is affordable only while this branch is unmerged.
class AddMarketplaceVersioningAndPreviewContainer < ActiveRecord::Migration[7.2] # rubocop:disable Metrics/ClassLength
  def up
    create_versions_table
    add_listing_versioning_columns
    add_source_instance_to_listings
    add_adoption_vintage_column
    repoint_listing_assessment_to_authoring
    add_preview_flag_to_courses

    backfill_source_instances
    backfill_first_versions
  end

  def down
    remove_column :courses, :preview
    restore_listing_assessment_column
    remove_adoption_vintage_column
    remove_source_instance_from_listings
    remove_listing_versioning_columns
    drop_table :course_assessment_marketplace_listing_versions
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

  def add_listing_versioning_columns
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
      t.references :fallback_maintainer, null: true,
                                         foreign_key: { to_table: :users,
                                                        name: 'fk_caml_fallback_maintainer_id' },
                                         index: { name: 'fk__caml_fallback_maintainer_id' }
    end
  end

  def remove_listing_versioning_columns
    change_table :course_assessment_marketplace_listings, bulk: true do |t|
      t.remove :current_version_id, :source_course_id, :source_course_name, :fallback_maintainer_id
    end
  end

  # The marketplace is cross-instance: a system admin sees listings whose source courses live in
  # other instances, and `Course` is `acts_as_tenant :instance`, so a course id only resolves on its
  # own instance's host. Recording the source instance is what lets the admin table both name the
  # origin ("which CS1010?") and build links that work (`//host/courses/:id`).
  #
  # An id, not a denormalised name string like `source_course_name` above: those
  # are strings precisely because their subject (the course) gets deleted, whereas instances are
  # long-lived. An id therefore survives the case we care about while yielding both the display name
  # and the host.
  def add_source_instance_to_listings
    add_reference :course_assessment_marketplace_listings, :source_instance,
                  null: true,
                  foreign_key: { to_table: :instances,
                                 name: 'fk_caml_source_instance_id',
                                 on_delete: :nullify },
                  index: { name: 'fk__caml_source_instance_id' }
  end

  def remove_source_instance_from_listings
    remove_reference :course_assessment_marketplace_listings, :source_instance,
                     foreign_key: { to_table: :instances, name: 'fk_caml_source_instance_id' },
                     index: { name: 'fk__caml_source_instance_id' }
  end

  def add_adoption_vintage_column
    # A datetime, not a version number: this is the content vintage the copy was made from, compared
    # against the listing's current version's `published_at`. Stored as a value rather than an FK so
    # a copy still knows how old its content is even if the version row is purged with its listing.
    #
    # There is no companion "dismissed" or "reminder mode" column: an adopter cannot silence the
    # update notice, so being behind is the whole of the state.
    add_column :course_assessment_marketplace_adoptions, :adopted_version_at, :datetime
  end

  def remove_adoption_vintage_column
    remove_column :course_assessment_marketplace_adoptions, :adopted_version_at
  end

  # `assessment_id` does not mean "what the marketplace shows" — that is now
  # `current_version.assessment` (the container snapshot). The column becomes the nullable authoring
  # copy, and the FK flips cascade -> nullify so deleting the origin orphans the listing instead of
  # destroying it along with its version chain and every adopter's adoption row.
  def repoint_listing_assessment_to_authoring
    remove_foreign_key :course_assessment_marketplace_listings, :course_assessments,
                       column: :assessment_id
    remove_index :course_assessment_marketplace_listings, column: :assessment_id
    rename_column :course_assessment_marketplace_listings, :assessment_id, :authoring_assessment_id
    change_column_null :course_assessment_marketplace_listings, :authoring_assessment_id, true

    add_index :course_assessment_marketplace_listings, :authoring_assessment_id,
              unique: true, where: 'authoring_assessment_id IS NOT NULL',
              name: 'index_caml_on_authoring_assessment_id'
    add_foreign_key :course_assessment_marketplace_listings, :course_assessments,
                    column: :authoring_assessment_id,
                    name: 'fk_caml_authoring_assessment_id', on_delete: :nullify
  end

  def restore_listing_assessment_column
    remove_foreign_key :course_assessment_marketplace_listings, :course_assessments,
                       column: :authoring_assessment_id
    remove_index :course_assessment_marketplace_listings, name: 'index_caml_on_authoring_assessment_id'

    # Orphans have no authoring assessment to point back at, so the NOT NULL cannot be restored
    # while they exist. This is why `down` is destructive and why this is not a `change`.
    execute 'DELETE FROM course_assessment_marketplace_listings WHERE authoring_assessment_id IS NULL'
    change_column_null :course_assessment_marketplace_listings, :authoring_assessment_id, false
    rename_column :course_assessment_marketplace_listings, :authoring_assessment_id, :assessment_id

    add_index :course_assessment_marketplace_listings, :assessment_id,
              unique: true, name: 'fk__course_assessment_marketplace_listings_assessment_id'
    add_foreign_key :course_assessment_marketplace_listings, :course_assessments,
                    column: :assessment_id,
                    name: 'fk_course_assessment_marketplace_listings_assessment_id',
                    on_delete: :cascade
  end

  def add_preview_flag_to_courses
    add_column :courses, :preview, :boolean, default: false, null: false
  end

  # Listings published before this migration read their instance off the surviving source course. Rows
  # already orphaned (`source_course_id IS NULL`) have nothing to read and stay NULL, displayed as "—"
  # forever: the snapshot lives in the preview instance rather than the origin and a publisher can
  # belong to several instances, so neither identifies the origin. Idempotent — only NULL rows.
  def backfill_source_instances
    Course::Assessment::Marketplace::PublishService.backfill_source_instances!
  end

  # Versions every existing published listing as v1 (snapshotting into the container via the publish
  # service) and stamps adopted_version = 1 on its adoptions. Idempotent — reruns skip
  # already-versioned listings.
  def backfill_first_versions
    Course::Assessment::Marketplace::PublishService.backfill_all!
  end
end
