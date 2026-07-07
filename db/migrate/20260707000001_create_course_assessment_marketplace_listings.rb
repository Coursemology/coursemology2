class CreateCourseAssessmentMarketplaceListings < ActiveRecord::Migration[7.2]
  def change
    create_table :course_assessment_marketplace_listings do |t|
      t.references :assessment, null: false,
                                foreign_key: { to_table: :course_assessments,
                                               name: 'fk_course_assessment_marketplace_listings_assessment_id',
                                               on_delete: :cascade },
                                index: { name: 'fk__course_assessment_marketplace_listings_assessment_id',
                                         unique: true }
      t.boolean :published, null: false, default: false
      t.datetime :first_published_at
      t.datetime :last_published_at
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
    add_index :course_assessment_marketplace_listings, :published,
              name: 'index_course_assessment_marketplace_listings_on_published'
  end
end
