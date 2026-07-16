# frozen_string_literal: true
class AddEveryoneUniquenessToMarketplaceAllowlistRules < ActiveRecord::Migration[7.2]
  def change
    # `everyone` is rule_type == 3 (enum below). A partial unique index enforces at most one such row,
    # the DB-level backstop for the model's `uniqueness` validation (repo rule: pair the two).
    add_index :course_assessment_marketplace_allowlist_rules, :rule_type,
              unique: true, where: 'rule_type = 3',
              name: 'index_marketplace_allowlist_rules_one_everyone'
  end
end
