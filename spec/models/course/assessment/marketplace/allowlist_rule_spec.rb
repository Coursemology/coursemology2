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

      it 'requires instance for an instance rule' do
        rule = build(:course_assessment_marketplace_allowlist_rule, rule_type: :instance, instance: nil)
        expect(rule).not_to be_valid
        expect(rule.errors[:instance]).to be_present
      end

      it 'is valid as an everyone rule with no target fields' do
        rule = build(:course_assessment_marketplace_allowlist_rule, :everyone)
        expect(rule).to be_valid
      end

      it 'allows only one everyone rule' do
        create(:course_assessment_marketplace_allowlist_rule, :everyone)
        duplicate = build(:course_assessment_marketplace_allowlist_rule, :everyone)
        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:rule_type]).to be_present
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

      it 'matches any user when an everyone rule exists' do
        user = create(:user)
        create(:course_assessment_marketplace_allowlist_rule, :everyone)
        expect(described_class.grants_access?(user)).to be(true)
      end

      it 'is false for a nil user even when an everyone rule exists' do
        create(:course_assessment_marketplace_allowlist_rule, :everyone)
        expect(described_class.grants_access?(nil)).to be(false)
      end

      it 'keeps granting a user rule after the user replaces their email (access is by user_id, not email)' do
        user = create(:user)
        original_email = user.email
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: user)
        expect(described_class.grants_access?(user)).to be(true)

        # Retire the original email and attach a brand-new one — the same person, different address.
        user.emails.where(email: original_email).delete_all
        create(:user_email, user: user, email: 'moved@newdomain.example')
        user.reload

        expect(described_class.grants_access?(user)).to be(true)
      end

      it 'does not grant access via a different user\'s rule after this user replaces their email' do
        user = create(:user)
        other_user = create(:user)
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: other_user)

        user.emails.where(email: user.email).delete_all
        create(:user_email, user: user, email: 'moved@newdomain.example')
        user.reload

        expect(described_class.grants_access?(user)).to be(false)
      end
    end

    describe 'email resolution for a user rule' do
      it 'resolves a confirmed email to the owning user' do
        target = create(:user, email: 'teacher@school.edu')
        rule = build(:course_assessment_marketplace_allowlist_rule, rule_type: :user,
                                                                    user: nil, email: 'teacher@school.edu')
        expect(rule).to be_valid
        expect(rule.user).to eq(target)
      end

      it 'is case-insensitive on the entered email' do
        target = create(:user, email: 'teacher@school.edu')
        rule = build(:course_assessment_marketplace_allowlist_rule, rule_type: :user,
                                                                    user: nil, email: '  Teacher@School.EDU ')
        expect(rule).to be_valid
        expect(rule.user).to eq(target)
      end

      it 'is invalid with a clear message when no user has that email' do
        rule = build(:course_assessment_marketplace_allowlist_rule, rule_type: :user,
                                                                    user: nil, email: 'nobody@nowhere.test')
        expect(rule).not_to be_valid
        expect(rule.errors.full_messages).to include('No user with that email.')
      end

      it 'does not also add a user-presence error when the email fails to resolve' do
        rule = build(:course_assessment_marketplace_allowlist_rule, rule_type: :user,
                                                                    user: nil, email: 'nobody@nowhere.test')
        expect(rule).not_to be_valid
        expect(rule.errors.full_messages).to eq(['No user with that email.'])
      end
    end

    describe 'duplicate rules' do
      it 'rejects a second user rule for the same user' do
        user = create(:user)
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: user)
        duplicate = build(:course_assessment_marketplace_allowlist_rule,
                          rule_type: :user, user: user)

        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:user_id]).to include('already has the same rule.')
      end

      it 'allows a user rule for a different user' do
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: create(:user))
        expect(build(:course_assessment_marketplace_allowlist_rule,
                     rule_type: :user, user: create(:user))).to be_valid
      end

      it 'rejects a second instance rule for the same instance' do
        other_instance = create(:instance)
        create(:course_assessment_marketplace_allowlist_rule,
               rule_type: :instance, instance: other_instance)
        duplicate = build(:course_assessment_marketplace_allowlist_rule,
                          rule_type: :instance, instance: other_instance)

        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:instance_id]).to include('already has the same rule.')
      end

      it 'rejects a second email-domain rule for the same domain' do
        create(:course_assessment_marketplace_allowlist_rule,
               rule_type: :email_domain, email_domain: 'dupes.test')
        duplicate = build(:course_assessment_marketplace_allowlist_rule,
                          rule_type: :email_domain, email_domain: 'dupes.test')

        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:email_domain]).to include('already has the same rule.')
      end

      it 'treats a differently-cased domain as the same rule' do
        create(:course_assessment_marketplace_allowlist_rule,
               rule_type: :email_domain, email_domain: 'dupes.test')
        duplicate = build(:course_assessment_marketplace_allowlist_rule,
                          rule_type: :email_domain, email_domain: '  DUPES.TEST  ')

        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:email_domain]).to include('already has the same rule.')
      end

      it 'normalizes the stored domain to stripped lowercase' do
        rule = create(:course_assessment_marketplace_allowlist_rule,
                      rule_type: :email_domain, email_domain: '  MiXeD.TEST ')
        expect(rule.reload.email_domain).to eq('mixed.test')
      end

      # A user rule whose email resolves to nobody keeps user_id NULL, and Rails checks uniqueness
      # as `user_id IS NULL` — which matches every instance and email-domain rule unless the check
      # is scoped to rule_type. Unscoped, the admin gets a bogus "already has the same rule." stacked on
      # top of the real reason. (Verified by mutation: dropping `scope: :rule_type` fails this.)
      it 'does not report a duplicate for an unresolvable email when other rule types exist' do
        create(:course_assessment_marketplace_allowlist_rule,
               rule_type: :instance, instance: create(:instance))
        rule = build(:course_assessment_marketplace_allowlist_rule,
                     rule_type: :user, user: nil, email: 'nobody@nowhere.test')

        expect(rule).not_to be_valid
        expect(rule.errors[:user_id]).to be_empty
        expect(rule.errors[:base]).to include('No user with that email.')
      end
    end

    describe 'when the targeted user is destroyed' do
      # Same FK trap as the access-blocks table: a user rule pins the user row, so deleting an
      # allow-listed user from the admin panel raised PG::ForeignKeyViolation.
      it 'destroys the rule instead of raising a foreign-key violation' do
        user = create(:user)
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: user)

        expect { ActsAsTenant.without_tenant { user.destroy } }.
          to change { described_class.count }.by(-1)
      end

      it 'leaves rules that do not target that user alone' do
        create(:course_assessment_marketplace_allowlist_rule,
               rule_type: :email_domain, email_domain: 'keeps.test')
        # Created under the tenant, destroyed without one (as the admin panel does): building a
        # user inside `without_tenant` fails its own `instance_users` validation.
        bystander = create(:user)

        expect { ActsAsTenant.without_tenant { bystander.destroy } }.
          not_to(change { described_class.count })
      end
    end
  end
end
