class CreateCourseAssessmentMarketplaceListings < ActiveRecord::Migration[7.2]
  def change
    create_table :course_assessment_marketplace_listings do |t|
      # Nullified, never cascaded: the listing outlives deletion of its origin assessment, keeping its
      # snapshots so a fresh authoring copy can be rebuilt from the latest one. The unique index is
      # partial for the same reason — every orphaned row holds NULL here.
      t.references :authoring_assessment, null: true,
                                          foreign_key: { to_table: :course_assessments,
                                                         name: 'fk_caml_authoring_assessment_id',
                                                         on_delete: :nullify },
                                          index: false
      t.boolean :published, null: false, default: false
      t.datetime :first_published_at
      t.datetime :last_published_at
      # Provenance. The id nullifies when the origin course is deleted; the denormalised name is what
      # survives to identify where the content came from afterwards.
      t.references :source_course, null: true,
                                   foreign_key: { to_table: :courses,
                                                  name: 'fk_caml_source_course_id',
                                                  on_delete: :nullify },
                                   index: { name: 'fk__caml_source_course_id' }
      t.string :source_course_name
      t.references :source_instance, null: true,
                                     foreign_key: { to_table: :instances,
                                                    name: 'fk_caml_source_instance_id',
                                                    on_delete: :nullify },
                                     index: { name: 'fk__caml_source_instance_id' }
      # The snapshot the marketplace treats as current. Its FK is added alongside the versions table
      # (20260728000000): the two tables reference each other, so one direction has to come second.
      t.references :current_version, null: true, index: { name: 'fk__caml_current_version_id' }
      t.references :fallback_maintainer, null: true,
                                         foreign_key: { to_table: :users,
                                                        name: 'fk_caml_fallback_maintainer_id' },
                                         index: { name: 'fk__caml_fallback_maintainer_id' }
      t.references :publisher, null: false,
                               foreign_key: { to_table: :users,
                                              name: 'fk_course_assessment_marketplace_listings_publisher_id' },
                               index: { name: 'fk__course_assessment_marketplace_listings_publisher_id' }
      t.references :creator, null: false,
                            foreign_key: { to_table: :users,
                                           name: 'fk_course_assessment_marketplace_listings_creator_id' },
                            index: { name: 'fk__course_assessment_marketplace_listings_creator_id' }
      t.references :updater, null: false,
                            foreign_key: { to_table: :users,
                                           name: 'fk_course_assessment_marketplace_listings_updater_id' },
                            index: { name: 'fk__course_assessment_marketplace_listings_updater_id' }
      t.timestamps null: false
    end
    add_index :course_assessment_marketplace_listings, :authoring_assessment_id,
              unique: true, where: 'authoring_assessment_id IS NOT NULL',
              name: 'index_caml_on_authoring_assessment_id'
    add_index :course_assessment_marketplace_listings, :published,
              name: 'index_course_assessment_marketplace_listings_on_published'
  end
end
