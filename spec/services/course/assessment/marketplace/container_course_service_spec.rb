# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::ContainerCourseService do
  let(:instance) { create(:instance) }
  let(:admin) { create(:administrator) }

  describe '.find_or_create!' do
    it 'creates one container course for the instance, with an assessment category and tab' do
      ActsAsTenant.with_tenant(instance) do
        course = described_class.find_or_create!(instance: instance, creator: admin)

        expect(course).to be_a(Course)
        expect(course.instance).to eq(instance)
        expect(course.marketplace_container).to be(true)
        expect(course.title).to eq('[System] Marketplace Preview Sandbox')
        expect(course.assessment_categories.first).to be_present
        expect(course.assessment_categories.first.tabs.first).to be_present
      end
    end

    # The nested category and tab validate creator/updater presence, but nothing passes them in —
    # they take the *stamper*. The suite installs a global one (`User.human_users.first`,
    # spec/support/userstamp.rb), so dropping `User.with_stamper` does not blow up: the records
    # silently get that arbitrary user as their creator. Only this assertion catches it.
    it 'stamps the nested category and tab with the caller, not the ambient stamper' do
      ActsAsTenant.with_tenant(instance) do
        course = described_class.find_or_create!(instance: instance, creator: admin)

        category = course.assessment_categories.first
        expect(category.creator).to eq(admin)
        expect(category.tabs.first.creator).to eq(admin)
      end
    end

    it 'is idempotent — a second call returns the same course and creates no new one' do
      ActsAsTenant.with_tenant(instance) do
        first = described_class.find_or_create!(instance: instance, creator: admin)

        expect do
          expect(described_class.find_or_create!(instance: instance, creator: admin)).to eq(first)
        end.not_to change(Course, :count)
      end
    end

    # The whole point of the column: the title must stop being identity. Renaming the container used
    # to orphan it and silently provision a second one on the next preview.
    it 'finds the container by its flag, not its title — a renamed container is still found' do
      ActsAsTenant.with_tenant(instance) do
        container = described_class.find_or_create!(instance: instance, creator: admin)
        container.update_column(:title, 'Renamed by an admin')

        expect do
          expect(described_class.find_or_create!(instance: instance, creator: admin)).to eq(container)
        end.not_to change(Course, :count)
      end
    end

    it 'does not adopt an ordinary course that happens to share the title' do
      ActsAsTenant.with_tenant(instance) do
        impostor = create(:course, instance: instance, title: '[System] Marketplace Preview Sandbox')

        container = described_class.find_or_create!(instance: instance, creator: admin)

        expect(container).not_to eq(impostor)
        expect(container.marketplace_container).to be(true)
        expect(impostor.reload.marketplace_container).to be(false)
      end
    end

    it 'adopts a legacy title-keyed container and marks it as the marketplace container' do
      ActsAsTenant.with_tenant(instance) do
        legacy = create(:course, instance: instance, title: 'Marketplace Previews (system)')

        expect do
          expect(described_class.find_or_create!(instance: instance, creator: admin)).to eq(legacy)
        end.not_to change(Course, :count)

        expect(legacy.reload.marketplace_container).to be(true)
        expect(legacy.title).to eq('[System] Marketplace Preview Sandbox')
      end
    end

    it 'returns the existing container when another request creates it first' do
      ActsAsTenant.with_tenant(instance) do
        created = nil
        allow(Course).to receive(:create!).and_wrap_original do |method, *args|
          created ||= method.call(*args)
          raise ActiveRecord::RecordNotUnique, 'duplicate marketplace container'
        end

        expect(described_class.find_or_create!(instance: instance, creator: admin)).to eq(created)
      end
    end

    it 'is per-instance — a second instance gets its own container' do
      other_instance = create(:instance)

      first = ActsAsTenant.with_tenant(instance) do
        described_class.find_or_create!(instance: instance, creator: admin)
      end
      second = ActsAsTenant.with_tenant(other_instance) do
        described_class.find_or_create!(instance: other_instance, creator: admin)
      end

      expect(second).not_to eq(first)
      expect(second.instance).to eq(other_instance)
    end
  end

  describe 'Course.not_marketplace_container' do
    it 'excludes the container and includes ordinary courses' do
      ActsAsTenant.with_tenant(instance) do
        container = described_class.find_or_create!(instance: instance, creator: admin)
        ordinary = create(:course, instance: instance)

        ids = Course.not_marketplace_container.pluck(:id)
        expect(ids).to include(ordinary.id)
        expect(ids).not_to include(container.id)
      end
    end
  end
end
