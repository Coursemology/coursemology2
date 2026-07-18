class CreateCourseAssessmentMarketplaceAdoptions < ActiveRecord::Migration[7.2]
  def change
    create_table :course_assessment_marketplace_adoptions do |t|
      t.references :listing, null: false,
                             foreign_key: { to_table: :course_assessment_marketplace_listings,
                                            name: 'fk_course_assessment_marketplace_adoptions_listing_id',
                                            on_delete: :cascade },
                             index: { name: 'fk__course_assessment_marketplace_adoptions_listing_id' }
      t.references :destination_course, null: false,
                                        foreign_key: { to_table: :courses,
                                                       name: 'fk_cama_destination_course_id',
                                                       on_delete: :cascade },
                                        index: { name: 'fk__cama_destination_course_id' }
      t.references :duplicated_assessment, null: false,
                                           foreign_key: { to_table: :course_assessments,
                                                          name: 'fk_cama_duplicated_assessment_id',
                                                          on_delete: :cascade },
                                           index: { name: 'fk__cama_duplicated_assessment_id',
                                                    unique: true }
      t.references :creator, null: false,
                            foreign_key: { to_table: :users,
                                           name: 'fk_course_assessment_marketplace_adoptions_creator_id' },
                            index: { name: 'fk__cama_creator_id' }
      t.references :updater, null: false,
                            foreign_key: { to_table: :users,
                                           name: 'fk_course_assessment_marketplace_adoptions_updater_id' },
                            index: { name: 'fk__cama_updater_id' }
      t.timestamps null: false
    end
    add_index :course_assessment_marketplace_adoptions, [:listing_id, :destination_course_id],
              name: 'index_cama_on_listing_id_and_destination_course_id'
  end
end
