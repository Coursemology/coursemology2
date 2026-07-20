# frozen_string_literal: true
module System::Admin::MarketplaceAccessHelper
  # The value half of a rule's label ("Email domain · <value>"), for the audit list's reason column.
  # @param [Course::Assessment::Marketplace::AllowlistRule] rule
  # @return [String, nil]
  def marketplace_rule_label_value(rule)
    case rule.rule_type
    when 'user' then rule.user&.name
    when 'instance' then rule.instance&.name
    when 'email_domain' then rule.email_domain
    end
  end
end
