# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace, type: :model do
  describe '.container' do
    before do
      # Deterministic across the repo's permanently-committing test DB: clear the
      # pointer so each example exercises the find-or-heal path from a known state.
      ActsAsTenant.without_tenant do
        Instance.default.settings(:marketplace).container_course_id = nil
        Instance.default.save!
      end
    end

    it 'creates a hidden, unpublished system container course in the default instance' do
      container = described_class.container
      expect(container).to be_a(Course)
      expect(container.instance_id).to eq(Instance::DEFAULT_INSTANCE_ID)
      expect(container.published).to be(false)
      expect(container.title).to eq(Course::Assessment::Marketplace::CONTAINER_TITLE)
    end

    it 'is created and updated by the system user' do
      container = described_class.container
      expect(container.creator).to eq(User.system)
      expect(container.updater).to eq(User.system)
    end

    it 'creates exactly one course when no pointer exists yet' do
      expect { described_class.container }.
        to change { ActsAsTenant.without_tenant { Course.count } }.by(1)
    end

    it 'persists the pointer and returns the same course on subsequent calls' do
      first = described_class.container
      second = described_class.container
      expect(second.id).to eq(first.id)
      ActsAsTenant.without_tenant do
        # Reload to bypass the memoized Instance.default and assert the pointer
        # was actually persisted to the DB (not just held in memory) — this is
        # what makes `save!` in create_container! observable.
        expect(Instance.default.reload.settings(:marketplace).container_course_id).to eq(first.id)
      end
    end

    it 'does not create a new course on subsequent calls' do
      described_class.container
      expect { described_class.container }.
        not_to(change { ActsAsTenant.without_tenant { Course.count } })
    end

    it 'enrolls only the system user as owner, so no other user ever sees it' do
      container = described_class.container
      other_user = ActsAsTenant.with_tenant(Instance.default) { create(:user) }
      ActsAsTenant.without_tenant do
        expect(Course.containing_user(User.system)).to include(container)
        expect(Course.containing_user(other_user)).not_to include(container)
      end
    end

    it 'is not publicly accessible' do
      container = described_class.container
      ActsAsTenant.without_tenant do
        expect(Course.publicly_accessible).not_to include(container)
      end
    end

    it 're-heals a stale pointer: creates exactly one replacement course and persists it' do
      ActsAsTenant.without_tenant do
        Instance.default.settings(:marketplace).container_course_id = -999
        Instance.default.save!
      end

      container = nil
      expect { container = described_class.container }.
        to change { ActsAsTenant.without_tenant { Course.count } }.by(1)
      expect(container.id).not_to eq(-999)
      ActsAsTenant.without_tenant do
        expect(Instance.default.settings(:marketplace).container_course_id).to eq(container.id)
      end
    end
  end
end
