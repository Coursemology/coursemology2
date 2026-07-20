# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::RuleMatchQuery, type: :model do
  let!(:instance) { Instance.default }

  # Specs commit (use_transactional_fixtures is false repo-wide), so rows from previous runs persist
  # and User::Email enforces uniqueness. Clear the fixed-domain addresses this file creates.
  #
  # The pattern must be LOWER()'d and must not anchor the '@': the uniqueness index is on
  # `lower(email)` while SQL LIKE is case-sensitive, and one example deliberately uses a SUBDOMAIN
  # (someone@sub.match-query.test). A '%@match-query.test' pattern misses both, leaving rows behind
  # that collide on the next run.
  before do
    User::Email.where('LOWER(email) LIKE ?', '%match-query.test').delete_all
  end

  with_tenant(:instance) do
    describe 'a user rule' do
      it 'matches only the targeted user, and only within the candidate set' do
        target = create(:user)
        other = create(:user)
        rule = build(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: target)

        expect(described_class.new(rule).user_ids_within([target.id, other.id])).
          to eq(Set[target.id])
      end

      it 'returns nothing when the targeted user is outside the candidate set' do
        target = create(:user)
        other = create(:user)
        rule = build(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: target)

        expect(described_class.new(rule).user_ids_within([other.id])).to be_empty
      end
    end

    describe 'an instance rule' do
      it 'matches candidates belonging to that instance, across tenants' do
        member = create(:user)
        outsider = create(:user)
        other_instance = create(:instance)
        ActsAsTenant.with_tenant(other_instance) do
          create(:instance_user, :instructor, user: member, instance: other_instance)
        end
        rule = build(:course_assessment_marketplace_allowlist_rule,
                     rule_type: :instance, instance: other_instance)

        expect(described_class.new(rule).user_ids_within([member.id, outsider.id])).
          to eq(Set[member.id])
      end
    end

    describe 'an email-domain rule' do
      it 'matches a candidate holding a confirmed email at that domain' do
        user = create(:user, email: 'teacher@match-query.test')
        rule = build(:course_assessment_marketplace_allowlist_rule,
                     rule_type: :email_domain, email_domain: 'match-query.test')

        expect(described_class.new(rule).user_ids_within([user.id])).to eq(Set[user.id])
      end

      it 'matches case-insensitively on both the rule and the address' do
        user = create(:user, email: 'head@match-query.test')
        # Force the stored address to mixed case directly. `create(:user, email: 'HEAD@...')`
        # raises RecordNotUnique even on a fresh address: the write path inserts both the given
        # and the normalized form, and the two collide under the `lower(email)` unique index.
        # Legacy rows can still hold mixed case, and the query's LOWER(SPLIT_PART(...)) on the
        # address side exists for exactly them — so this is the only way to reach that branch.
        User::Email.where(user_id: user.id).
          where('LOWER(email) = ?', 'head@match-query.test').
          update_all(email: 'HEAD@MATCH-QUERY.TEST')
        rule = build(:course_assessment_marketplace_allowlist_rule,
                     rule_type: :email_domain, email_domain: 'Match-Query.TEST')

        expect(described_class.new(rule).user_ids_within([user.id])).to eq(Set[user.id])
      end

      it 'ignores an unconfirmed address at that domain' do
        user = create(:user) # confirmed primary email at a non-matching domain
        create(:user_email, :unconfirmed, email: 'pending@match-query.test',
                                          user: user, primary: false)
        rule = build(:course_assessment_marketplace_allowlist_rule,
                     rule_type: :email_domain, email_domain: 'match-query.test')

        expect(described_class.new(rule).user_ids_within([user.id])).to be_empty
      end

      it 'does not match a different domain that merely shares a suffix' do
        user = create(:user, email: 'someone@sub.match-query.test')
        rule = build(:course_assessment_marketplace_allowlist_rule,
                     rule_type: :email_domain, email_domain: 'match-query.test')

        expect(described_class.new(rule).user_ids_within([user.id])).to be_empty
      end
    end

    describe 'an everyone rule' do
      it 'matches the whole candidate set' do
        a = create(:user)
        b = create(:user)
        rule = build(:course_assessment_marketplace_allowlist_rule, :everyone)

        expect(described_class.new(rule).user_ids_within([a.id, b.id])).to eq(Set[a.id, b.id])
      end
    end

    it 'returns an empty set for an empty candidate list without querying' do
      rule = build(:course_assessment_marketplace_allowlist_rule, :everyone)
      expect(described_class.new(rule).user_ids_within([])).to be_empty
    end

    it 'treats an unsaved rule identically to a persisted one' do
      target = create(:user)
      unsaved = build(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: target)
      persisted = create(:course_assessment_marketplace_allowlist_rule,
                         rule_type: :user, user: target)

      expect(described_class.new(unsaved).user_ids_within([target.id])).
        to eq(described_class.new(persisted).user_ids_within([target.id]))
    end
  end
end
