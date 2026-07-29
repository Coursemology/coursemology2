# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::RestoreAuthoringService, type: :service do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    # The duplication itself enqueues nothing, but the env default is `:background_thread` — a real
    # thread sharing this example's connection — and these examples assert on container row counts.
    with_active_job_queue_adapter(:test) do
      let(:source_course) { create(:course) }
      let(:source_assessment) { create(:assessment, :with_mcq_question, course: source_course) }
      let(:user) { create(:administrator) }
      # Published through the real service so the snapshot genuinely lives in the container course in
      # the preview instance: restoring must duplicate ACROSS instances, exactly as adoption does.
      let(:listing) { Course::Assessment::Marketplace::PublishService.publish(source_assessment, user) }

      def container
        ActsAsTenant.without_tenant do
          Course::Assessment::Marketplace::PreviewContainerService.container_course
        end
      end

      def container_assessment_count
        ActsAsTenant.without_tenant { container.assessments.count }
      end

      # The only way a listing is orphaned now that `Course::Assessment` re-points inside the destroy
      # transaction: the column is nulled underneath the model layer, as `fk_caml_authoring_assessment_id`
      # does when a delete bypasses the callback. That is the state this service exists to repair.
      def orphan!(target = listing)
        target.update_column(:authoring_assessment_id, nil)
        target.reload
      end

      def restore(target = listing)
        described_class.restore!(target, current_user: user)
      end

      describe '.restore!' do
        before { orphan! }

        it 'duplicates the snapshot into the container course' do
          expect { restore }.to change { container_assessment_count }.by(1)
        end

        # A NEW assessment beside the snapshots, never one of them. Editing a snapshot would mutate a
        # published version for every adopter with no version cut.
        it 'creates a new assessment rather than reusing the snapshot' do
          snapshot = ActsAsTenant.without_tenant { listing.current_version.assessment }

          restore

          copy = listing.reload.authoring_assessment
          expect(copy.id).not_to eq(snapshot.id)
          expect(snapshot.reload).to be_persisted
          expect(listing.current_version.reload.assessment_id).to eq(snapshot.id)
        end

        # Pinned deliberately: this holds only because ObjectDuplicationService's object-mode default
        # is `unpublish_all: true` and no caller overrides it. A published copy in the container would
        # be visible to previewers, so this must fail loudly if that default ever changes.
        it 'lands the copy as a draft' do
          restore

          expect(listing.reload.authoring_assessment.published).to be(false)
        end

        it 'points the listing at the new copy, un-orphaning it' do
          restore

          expect(listing.reload.authoring_assessment).to be_present
          expect(listing.reload).not_to be_orphaned
        end

        it 'carries the snapshot content into the copy' do
          snapshot_title = ActsAsTenant.without_tenant { listing.current_version.assessment.title }

          restore

          copy = listing.reload.authoring_assessment
          expect(copy.title).to eq(snapshot_title)
          expect(copy.questions.count).to eq(1)
        end

        # Everything descended from the original source stays comparable for plagiarism, so the copy
        # inherits the snapshot's duplication root rather than starting a tree of its own. Matches the
        # re-point that runs inside `Course::Assessment#destroy`.
        it 'inherits the snapshot link tree' do
          snapshot = ActsAsTenant.without_tenant { listing.current_version.assessment }

          restore

          copy = listing.reload.authoring_assessment
          expect(copy.linkable_tree_id).to eq(snapshot.linkable_tree_id)
        end

        # Repairing maintenance access is not a course adopting the content.
        it 'records no adoption' do
          expect { restore }.not_to change(Course::Assessment::Marketplace::Adoption, :count)
        end

        # Provenance describes where the content originally came from. A repair must not rewrite that
        # historical fact — the row goes on naming the origin course after the copy moves.
        it 'leaves the provenance fields untouched' do
          provenance = [:source_course_id, :source_course_name, :source_instance_id]
          before_restore = listing.slice(*provenance)

          restore

          expect(listing.reload.slice(*provenance)).to eq(before_restore)
        end

        # The end-to-end proof for `#marketplace_hosted?`: the copy lands in the real container, so the
        # admin table can tell a repaired listing from one that still has its own source course.
        it 'reports the listing as marketplace-hosted afterwards' do
          expect { restore }.to change { listing.reload.marketplace_hosted? }.from(false).to(true)
        end

        it 'cuts no version — restoring is not a republish' do
          expect { restore }.not_to(change { listing.reload.current_version_id })
        end

        it 'lets the listing cut a new version again' do
          restore

          expect do
            Course::Assessment::Marketplace::PublishService.publish_new_version(listing.reload, user)
          end.to(change { listing.reload.current_version_id })
        end
      end
    end
  end
end
