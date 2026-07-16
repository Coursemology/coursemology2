# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::AllowlistRule, type: :model do
  let!(:instance) { Instance.default }

  before do
    Course::Assessment::Marketplace::AllowlistRule.delete_all
    User::Email.delete_all
  end

  with_tenant(:instance) do
    describe 'validations' do
      it 'requires user for a user rule' do
        rule = build(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: nil)
        expect(rule).not_to be_valid
        expect(rule.errors[:user]).to be_present
      end

      it 'requires email_domain for an email_domain rule' do
        rule = build(:course_assessment_marketplace_allowlist_rule,
                     rule_type: :email_domain, email_domain: nil)
        expect(rule).not_to be_valid
        expect(rule.errors[:email_domain]).to be_present
      end
    end

    describe '.grants_access?' do
      it 'is false for a nil user' do
        expect(described_class.grants_access?(nil)).to be(false)
      end

      it 'is false when no rule matches' do
        user = create(:user)
        create(:course_assessment_marketplace_allowlist_rule, :for_email_domain,
               email_domain: 'nomatch.example')
        expect(described_class.grants_access?(user)).to be(false)
      end

      it 'matches an explicit user rule' do
        user = create(:user)
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: user)
        expect(described_class.grants_access?(user)).to be(true)
      end

      it 'matches an instance rule when the user belongs to that instance' do
        user = create(:user)
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :instance, instance: instance)
        expect(described_class.grants_access?(user)).to be(true)
      end

      it 'does not match an instance rule for another instance under the current tenant' do
        user = create(:user)
        other_instance = create(:instance)
        ActsAsTenant.with_tenant(other_instance) { InstanceUser.create!(user: user) }
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :instance,
                                                              instance: other_instance)
        # `user.instance_users` is tenant-scoped (acts_as_tenant), so an instance rule grants
        # access only while browsing the allow-listed instance — membership elsewhere is invisible.
        expect(described_class.grants_access?(user)).to be(false)
      end

      it 'matches an email-domain rule case-insensitively' do
        user_email = create(:user_email, email: 'testuser@Schools.GOV.sg')
        user = user_email.user
        create(:course_assessment_marketplace_allowlist_rule, :for_email_domain,
               email_domain: 'schools.gov.sg')
        expect(described_class.grants_access?(user)).to be(true)
      end

      it 'does not match a different email domain' do
        user_email = create(:user_email, email: 'testuser@other.edu')
        user = user_email.user
        create(:course_assessment_marketplace_allowlist_rule, :for_email_domain,
               email_domain: 'schools.gov.sg')
        expect(described_class.grants_access?(user)).to be(false)
      end
    end
  end
end
