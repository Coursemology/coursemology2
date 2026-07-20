# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::AccessBlock, type: :model do
  let!(:instance) { Instance.default }

  before { described_class.delete_all }

  with_tenant(:instance) do
    describe 'validations' do
      it 'is valid with a user and creator' do
        block = build(:course_assessment_marketplace_access_block)
        expect(block).to be_valid
      end

      it 'rejects a second block for the same user' do
        user = create(:user)
        create(:course_assessment_marketplace_access_block, user: user)
        duplicate = build(:course_assessment_marketplace_access_block, user: user)
        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:user_id]).to be_present
      end
    end

    describe '.blocked?' do
      it 'is false for a nil user' do
        expect(described_class.blocked?(nil)).to be(false)
      end

      it 'is false when the user has no block' do
        expect(described_class.blocked?(create(:user))).to be(false)
      end

      it 'is true when the user has a block' do
        user = create(:user)
        create(:course_assessment_marketplace_access_block, user: user)
        expect(described_class.blocked?(user)).to be(true)
      end
    end

    describe '.blocked_user_ids' do
      it 'returns the user ids of all blocks' do
        user = create(:user)
        create(:course_assessment_marketplace_access_block, user: user)
        expect(described_class.blocked_user_ids).to contain_exactly(user.id)
      end
    end

    describe 'when the admin who issued the block is destroyed' do
      # `creator_id` is NOT NULL and FKs to users, so this raised PG::ForeignKeyViolation. The block
      # must survive — it is a decision about the BLOCKED person, not about its author — so
      # authorship is reassigned to the Deleted user rather than the row being destroyed.
      it 'keeps the block and reassigns it to the Deleted user' do
        creator = create(:administrator)
        block = create(:course_assessment_marketplace_access_block, creator: creator)

        expect { ActsAsTenant.without_tenant { creator.destroy } }.
          not_to(change { described_class.count })
        expect(block.reload.creator_id).to eq(User::DELETED_USER_ID)
      end
    end

    describe 'when the blocked user is destroyed' do
      # The blocks table has an FK to users with no ON DELETE, so without a `dependent:` association
      # on User the admin panel's delete-user action dies with PG::ForeignKeyViolation.
      it 'destroys the block instead of raising a foreign-key violation' do
        user = create(:user)
        create(:course_assessment_marketplace_access_block, user: user)

        expect { ActsAsTenant.without_tenant { user.destroy } }.
          to change { described_class.count }.by(-1)
      end
    end
  end
end
