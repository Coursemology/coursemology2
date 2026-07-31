# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::PreviewContainerService, type: :service do
  # The dedicated preview instance/course are cross-tenant singletons created by the service itself,
  # so this spec runs under the default tenant and lets the service switch tenants internally.
  let!(:default_instance) { Instance.default }

  with_tenant(:default_instance) do
    describe '.preview_instance' do
      it 'returns the dedicated non-default preview instance, idempotently' do
        first = described_class.preview_instance
        second = described_class.preview_instance

        expect(second).to eq(first)
        expect(first).not_to be_default
        expect(first.read_attribute(:host)).to eq(described_class::PREVIEW_INSTANCE_HOST)
        expect(first.name).to eq(described_class::PREVIEW_INSTANCE_NAME)
      end
    end

    describe '.container_course' do
      it 'returns a single preview-flagged container course in the preview instance, idempotently' do
        first = described_class.container_course
        second = described_class.container_course

        expect(second).to eq(first)
        expect(first).to be_preview
        expect(first.instance).to eq(described_class.preview_instance)
        expect(first.title).to eq(described_class::PREVIEW_COURSE_TITLE)
      end

      it 'does not create a second container course on the second call' do
        described_class.container_course
        expect { described_class.container_course }.
          not_to(change do
                   ActsAsTenant.with_tenant(described_class.preview_instance) do
                     Course.where(preview: true).count
                   end
                 end)
      end

      # The container holds every published version snapshot, so it must never surface as a course
      # in its own right — not in a listing, not via self-enrolment, not to any user but the system
      # one. Previewers are attached explicitly, one at a time.
      it 'is unpublished, ungamified and not self-enrollable' do
        container = described_class.container_course

        expect(container.published).to be(false)
        expect(container.gamified).to be(false)
        expect(container.enrollable).to be(false)
      end

      # Only `creator` is asserted. `updater` is deliberately NOT an invariant: the container is a
      # long-lived singleton that every publish snapshots into, and those writes re-stamp it with
      # the publisher. Asserting `updater == User.system` only passes on a container no one has
      # published into yet.
      it 'is created by the system user' do
        container = described_class.container_course

        expect(container.creator).to eq(User.system)
      end

      it 'is not publicly accessible' do
        container = described_class.container_course

        ActsAsTenant.without_tenant do
          expect(Course.publicly_accessible).not_to include(container)
        end
      end

      it 'enrolls only the system user, so no other user ever sees it' do
        container = described_class.container_course
        # Enroll other_user in an unrelated real course so the negative assertion is non-vacuous:
        # containing_user DOES surface a course they belong to, yet never the container.
        other_course = create(:course)
        other_user = create(:course_manager, course: other_course).user

        ActsAsTenant.without_tenant do
          expect(Course.containing_user(User.system)).to include(container)
          expect(Course.containing_user(other_user)).to include(other_course)
          expect(Course.containing_user(other_user)).not_to include(container)
        end
      end

    end
  end
end
