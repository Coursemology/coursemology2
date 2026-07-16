# frozen_string_literal: true
class CreateCourseAssessmentMarketplaceAllowlistRules < ActiveRecord::Migration[7.2]
  def change
    create_table :course_assessment_marketplace_allowlist_rules do |t|
      t.integer :rule_type, null: false
      t.references :user, foreign_key: { to_table: :users }, null: true, index: true
      t.references :instance, foreign_key: true, null: true, index: true
      t.string :email_domain, null: true
      t.timestamps
    end
    add_index :course_assessment_marketplace_allowlist_rules, :email_domain
  end
end
