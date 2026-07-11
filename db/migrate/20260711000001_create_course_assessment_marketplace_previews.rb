# frozen_string_literal: true
class CreateCourseAssessmentMarketplacePreviews < ActiveRecord::Migration[7.2]
  def change
    create_table :course_assessment_marketplace_previews do |t|
      t.references :listing, null: false,
                   foreign_key: { to_table: :course_assessment_marketplace_listings }
      t.references :course_user, null: false, foreign_key: true
      t.references :assessment, null: false,
                   foreign_key: { to_table: :course_assessments }
      t.timestamps
    end
    add_index :course_assessment_marketplace_previews,
              [:listing_id, :course_user_id], unique: true
  end
end