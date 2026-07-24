# frozen_string_literal: true
class CreateCourseAssessmentMarketplaceAllowlistRules < ActiveRecord::Migration[7.2]
  def change
    create_table :course_assessment_marketplace_allowlist_rules do |t|
      t.integer :rule_type, null: false

      t.references :user,
                   foreign_key: { to_table: :users },
                   null: true,
                   index: true

      t.references :instance,
                   foreign_key: true,
                   null: true,
                   index: true

      t.string :email_domain, null: true

      t.timestamps
    end

    add_index :course_assessment_marketplace_allowlist_rules,
              :email_domain

    add_index :course_assessment_marketplace_allowlist_rules,
              :user_id,
              unique: true,
              where: "rule_type = 0",
              name: "index_marketplace_allowlist_rules_one_per_user"

    add_index :course_assessment_marketplace_allowlist_rules,
              :instance_id,
              unique: true,
              where: "rule_type = 1",
              name: "index_marketplace_allowlist_rules_one_per_instance"

    add_index :course_assessment_marketplace_allowlist_rules,
              :email_domain,
              unique: true,
              where: "rule_type = 2",
              name: "index_marketplace_allowlist_rules_one_per_email_domain"

    add_index :course_assessment_marketplace_allowlist_rules,
              :rule_type,
              unique: true,
              where: "rule_type = 3",
              name: "index_marketplace_allowlist_rules_one_everyone"

    create_table :course_assessment_marketplace_access_blocks do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.references :creator, null: false, foreign_key: { to_table: :users }
      t.timestamps
    end
  end
end
