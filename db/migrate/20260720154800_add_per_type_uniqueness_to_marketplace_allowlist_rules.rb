# frozen_string_literal: true
class AddPerTypeUniquenessToMarketplaceAllowlistRules < ActiveRecord::Migration[7.2]
  TABLE = :course_assessment_marketplace_allowlist_rules

  def up
    normalize_email_domains
    delete_duplicates

    add_index TABLE, :user_id, unique: true, where: 'rule_type = 0',
                               name: 'index_marketplace_allowlist_rules_one_per_user'
    add_index TABLE, :instance_id, unique: true, where: 'rule_type = 1',
                                   name: 'index_marketplace_allowlist_rules_one_per_instance'
    add_index TABLE, :email_domain, unique: true, where: 'rule_type = 2',
                                    name: 'index_marketplace_allowlist_rules_one_per_email_domain'
  end

  def down
    remove_index TABLE, name: 'index_marketplace_allowlist_rules_one_per_user'
    remove_index TABLE, name: 'index_marketplace_allowlist_rules_one_per_instance'
    remove_index TABLE, name: 'index_marketplace_allowlist_rules_one_per_email_domain'
  end

  private

  # Domain matching has always been case-insensitive, so `MOE.GOV.SG` and `moe.gov.sg` are the same
  # rule and must collide under the index added below.
  def normalize_email_domains
    execute(<<~SQL.squish)
      UPDATE #{TABLE} SET email_domain = LOWER(TRIM(email_domain))
      WHERE rule_type = 2 AND email_domain IS NOT NULL
    SQL
  end

  # Exactly-redundant rows: a duplicate granted nothing its survivor does not, so keeping the lowest
  # id loses no configuration. Without this, the unique indexes cannot be created on any database
  # that already accumulated duplicates — including developer machines.
  def delete_duplicates
    execute(<<~SQL.squish)
      DELETE FROM #{TABLE} a USING #{TABLE} b
      WHERE a.id > b.id AND a.rule_type = b.rule_type
        AND ((a.rule_type = 0 AND a.user_id = b.user_id)
          OR (a.rule_type = 1 AND a.instance_id = b.instance_id)
          OR (a.rule_type = 2 AND a.email_domain = b.email_domain))
    SQL
  end
end
