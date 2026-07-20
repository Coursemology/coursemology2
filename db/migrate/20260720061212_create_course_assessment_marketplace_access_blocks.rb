# frozen_string_literal: true
class CreateCourseAssessmentMarketplaceAccessBlocks < ActiveRecord::Migration[7.2]
  def change
    create_table :course_assessment_marketplace_access_blocks do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.references :creator, null: false, foreign_key: { to_table: :users }
      t.timestamps
    end
  end
end
