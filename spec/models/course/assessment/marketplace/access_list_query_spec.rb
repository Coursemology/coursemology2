# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::AccessListQuery, type: :model do
  let!(:instance) { Instance.default }

  # Specs here commit (use_transactional_fixtures is false repo-wide), so rows from previous runs
  # persist. User::Email additionally enforces uniqueness, so the allow-listed-domain addresses below
  # must be cleared too or re-creating them raises RecordInvalid.
  before do
    Course::Assessment::Marketplace::AllowlistRule.delete_all
    Course::Assessment::Marketplace::AccessBlock.delete_all
    # LOWER() and no '@' anchor: the uniqueness index is on `lower(email)` while SQL LIKE is
    # case-sensitive, so an anchored, case-sensitive pattern silently leaves rows behind that
    # collide on the next run.
    User::Email.where('LOWER(email) LIKE ?', '%schools.gov.sg').delete_all
  end

  with_tenant(:instance) do
    it 'excludes a baseline user when no rule matches them' do
      create(:course_manager, course: create(:course)) # manager, but no allow-list rule
      # System admins are listed unconditionally (they bypass every gate), and the test DB always
      # holds at least the seeded one — so this asserts on the non-admin rows.
      expect(described_class.new.rows.reject(&:system_admin?)).to be_empty
    end

    it 'includes a manager cleared by a user rule, annotated with course count and rule' do
      cu = create(:course_manager, course: create(:course))
      create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: cu.user)

      row = described_class.new.rows.find { |r| r.user == cu.user }
      expect(row).not_to be_nil
      expect(row.course_count).to eq(1)
      expect(row.instance_role).to be_nil
      expect(row.allowed_by_rules.map(&:rule_type)).to eq(['user'])
      expect(row.blocked?).to be(false)
    end

    it 'includes an instance instructor (managing no course) under an everyone rule' do
      user = create(:user)
      other_instance = create(:instance)
      ActsAsTenant.with_tenant(other_instance) do
        create(:instance_user, :instructor, user: user, instance: other_instance)
      end
      create(:course_assessment_marketplace_allowlist_rule, :everyone)

      row = described_class.new.rows.find { |r| r.user == user }
      expect(row).not_to be_nil
      expect(row.course_count).to eq(0)
      expect(row.instance_role).to eq('instructor')
      # An everyone rule is a page-level mode, not a per-row reason: rows carry no scoped rules.
      expect(row.allowed_by_rules).to be_empty
    end

    it 'includes a manager cleared by an email-domain rule' do
      user = create(:user, email: 'teacher@schools.gov.sg')
      create(:course_manager, course: create(:course), user: user)
      create(:course_assessment_marketplace_allowlist_rule, :for_email_domain,
             email_domain: 'schools.gov.sg')

      row = described_class.new.rows.find { |r| r.user == user }
      expect(row).not_to be_nil
      expect(row.allowed_by_rules.map(&:rule_type)).to eq(['email_domain'])
    end

    it 'excludes a manager whose only allow-listed-domain email is unconfirmed' do
      user = create(:user) # has a confirmed primary email at a non-matching domain
      create(:course_manager, course: create(:course), user: user)
      create(:user_email, :unconfirmed, email: 'pending@schools.gov.sg',
                                        user: user, primary: false)
      create(:course_assessment_marketplace_allowlist_rule, :for_email_domain,
             email_domain: 'schools.gov.sg')

      expect(described_class.new.rows.map(&:user)).not_to include(user)
    end

    it 'includes a manager cleared by an instance rule' do
      cu = create(:course_manager, course: create(:course))
      # cu.user has a normal InstanceUser in the default instance via the after_create callback,
      # so an instance rule for the default instance clears them.
      create(:course_assessment_marketplace_allowlist_rule, rule_type: :instance, instance: instance)

      row = described_class.new.rows.find { |r| r.user == cu.user }
      expect(row).not_to be_nil
      expect(row.allowed_by_rules.map(&:rule_type)).to eq(['instance'])
    end

    it 'does not include a non-baseline user even when a user rule targets them' do
      cu = create(:course_student, course: create(:course))
      create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: cu.user)
      expect(described_class.new.rows.map(&:user)).not_to include(cu.user)
    end

    it 'keeps a blocked user in the list, flagged with the block id' do
      cu = create(:course_manager, course: create(:course))
      create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: cu.user)
      block = create(:course_assessment_marketplace_access_block, user: cu.user)

      row = described_class.new.rows.find { |r| r.user == cu.user }
      expect(row.blocked?).to be(true)
      expect(row.block_id).to eq(block.id)
    end

    # Without this, dropping the `instance_id` filter from RuleMatchQuery#matched_instance_members
    # would still pass every other example — the instance-rule test above uses only one instance.
    it 'does not clear a user via an instance rule scoped to a different instance' do
      rule_instance = create(:instance)
      member_instance = create(:instance)
      cu = create(:course_manager, course: create(:course))
      ActsAsTenant.with_tenant(member_instance) do
        create(:instance_user, :instructor, user: cu.user, instance: member_instance)
      end
      create(:course_assessment_marketplace_allowlist_rule,
             rule_type: :instance, instance: rule_instance)

      expect(described_class.new.rows.map(&:user)).not_to include(cu.user)
    end

    it 'lists every rule matching a user, not just the highest-precedence one' do
      user = create(:user, email: 'both@schools.gov.sg')
      create(:course_manager, course: create(:course), user: user)
      user_rule = create(:course_assessment_marketplace_allowlist_rule,
                         rule_type: :user, user: user)
      domain_rule = create(:course_assessment_marketplace_allowlist_rule, :for_email_domain,
                           email_domain: 'schools.gov.sg')

      row = described_class.new.rows.find { |r| r.user == user }
      expect(row.allowed_by_rules.map(&:id)).to contain_exactly(user_rule.id, domain_rule.id)
    end

    it 'orders a row\'s rules by rule id' do
      user = create(:user, email: 'ordered@schools.gov.sg')
      create(:course_manager, course: create(:course), user: user)
      first = create(:course_assessment_marketplace_allowlist_rule, :for_email_domain,
                     email_domain: 'schools.gov.sg')
      second = create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: user)

      row = described_class.new.rows.find { |r| r.user == user }
      expect(row.allowed_by_rules.map(&:id)).to eq([first.id, second.id])
    end

    it 'lists a blocked user whose matching rule was removed, so the block stays reachable' do
      cu = create(:course_manager, course: create(:course))
      block = create(:course_assessment_marketplace_access_block, user: cu.user)
      # No allow-list rule matches them at all — without the block they would not be listed.

      row = described_class.new.rows.find { |r| r.user == cu.user }
      expect(row).not_to be_nil
      expect(row.allowed_by_rules).to be_empty
      expect(row.block_id).to eq(block.id)
      expect(row.blocked?).to be(true)
    end

    it 'lists a blocked user who is no longer baseline-eligible at all' do
      user = create(:user) # manages nothing, staff nowhere
      create(:course_assessment_marketplace_access_block, user: user)

      row = described_class.new.rows.find { |r| r.user == user }
      expect(row).not_to be_nil
      expect(row.course_count).to eq(0)
      expect(row.instance_role).to be_nil
    end

    describe '#allowed_user_ids' do
      it 'returns baseline users cleared by a rule, and excludes uncleared ones' do
        cleared = create(:course_manager, course: create(:course))
        uncleared = create(:course_manager, course: create(:course))
        create(:course_assessment_marketplace_allowlist_rule,
               rule_type: :user, user: cleared.user)

        ids = described_class.new.allowed_user_ids
        expect(ids).to include(cleared.user.id)
        expect(ids).not_to include(uncleared.user.id)
      end

      it 'still counts a blocked user as allowed — a block is not an allow-list decision' do
        cu = create(:course_manager, course: create(:course))
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: cu.user)
        create(:course_assessment_marketplace_access_block, user: cu.user)

        expect(described_class.new.allowed_user_ids).to include(cu.user.id)
      end

      # Guards the `everyone?` branch: without it, collapsing the method to `rules_by_user.keys`
      # would silently regress open-to-everyone into "only explicitly matched users".
      it 'includes every baseline user when an everyone rule exists, not only rule-matched ones' do
        first = create(:course_manager, course: create(:course))
        second = create(:course_manager, course: create(:course))
        create(:course_assessment_marketplace_allowlist_rule, :everyone)

        ids = described_class.new.allowed_user_ids
        expect(ids).to include(first.user.id, second.user.id)
      end
    end

    describe 'system administrators' do
      it 'lists an admin who manages nothing and matches no rule' do
        admin = create(:administrator)

        row = described_class.new.rows.find { |r| r.user == admin }
        expect(row).not_to be_nil
        expect(row.system_admin?).to be(true)
        expect(row.allowed_by_rules).to be_empty
      end

      it 'keeps listing an admin as blocked when a block exists' do
        # A block row cannot actually revoke a sysadmin's bypass, but an orphaned one must stay
        # visible and clearable — same contract as any other blocked user.
        admin = create(:administrator)
        create(:course_assessment_marketplace_access_block, user: admin)

        row = described_class.new.rows.find { |r| r.user == admin }
        expect(row.system_admin?).to be(true)
        expect(row.blocked?).to be(true)
      end

      it 'still records the rules that match an admin' do
        admin = create(:administrator)
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: admin)

        row = described_class.new.rows.find { |r| r.user == admin }
        expect(row.system_admin?).to be(true)
        expect(row.allowed_by_rules.map(&:rule_type)).to eq(['user'])
      end

      it 'does not mark a non-admin as one' do
        cu = create(:course_manager, course: create(:course))
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: cu.user)

        row = described_class.new.rows.find { |r| r.user == cu.user }
        expect(row.system_admin?).to be(false)
      end
    end

    describe '#summary' do
      it 'counts effective access and blocked separately, and reports the mode' do
        active = create(:course_manager, course: create(:course))
        blocked = create(:course_manager, course: create(:course))
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: active.user)
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: blocked.user)
        create(:course_assessment_marketplace_access_block, user: blocked.user)

        # Admins are always listed and always count as having access, and the test DB carries at
        # least the seeded one, so the expectation is relative to however many exist.
        admins = User.administrator.count
        summary = described_class.new.summary
        expect(summary[:total_with_access]).to eq(1 + admins)
        expect(summary[:total_blocked]).to eq(1)
        expect(summary[:open_to_everyone]).to be(false)
      end

      it 'reports open_to_everyone when an everyone rule exists' do
        create(:course_assessment_marketplace_allowlist_rule, :everyone)
        expect(described_class.new.summary[:open_to_everyone]).to be(true)
      end
    end
  end
end
