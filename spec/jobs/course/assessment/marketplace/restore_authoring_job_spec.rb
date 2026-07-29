# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::RestoreAuthoringJob, type: :job do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:source_course) { create(:course) }
    let(:source_assessment) { create(:assessment, :with_mcq_question, course: source_course) }
    # Published through the real service so the snapshot genuinely lives in the container course in
    # the preview instance: restoring must duplicate ACROSS instances, exactly as adoption does.
    let(:listing) { Course::Assessment::Marketplace::PublishService.publish(source_assessment, user) }
    let(:user) { create(:administrator) }

    def container
      ActsAsTenant.without_tenant do
        Course::Assessment::Marketplace::PreviewContainerService.container_course
      end
    end

    # Deleting the authoring assessment nullifies `authoring_assessment_id` (`dependent: :nullify`),
    # which is what "orphaned" means.
    def orphan!
      listing
      source_assessment.destroy!
      listing.reload
    end

    def run
      described_class.perform_now(listing.id, current_user: user)
    end

    context 'when the listing is orphaned with a version' do
      before { orphan! }

      it 'duplicates the snapshot into the container course' do
        expect { run }.to change { container.assessments.count }.by(1)
      end

      # A NEW assessment beside the snapshots, never one of them. Editing a snapshot would mutate a
      # published version for every adopter with no version cut.
      it 'creates a new assessment rather than reusing the snapshot' do
        snapshot = listing.current_version.assessment

        run

        copy = listing.reload.authoring_assessment
        expect(copy.id).not_to eq(snapshot.id)
        expect(snapshot.reload).to be_persisted
        expect(listing.current_version.reload.assessment_id).to eq(snapshot.id)
      end

      # Pinned deliberately: this holds only because ObjectDuplicationService's object-mode default is
      # `unpublish_all: true` and no caller overrides it. A published working copy in the container
      # would be visible to PR8 previewers, so this must fail loudly if that default ever changes.
      it 'lands the working copy as a draft' do
        run

        expect(listing.reload.authoring_assessment.published).to be(false)
      end

      it 'points the listing at the new copy, un-orphaning it' do
        run

        copy = listing.reload.authoring_assessment
        expect(listing.reload.authoring_assessment).to eq(copy)
        expect(listing).not_to be_orphaned
      end

      it 'carries the snapshot content into the copy' do
        snapshot_title = ActsAsTenant.without_tenant { listing.current_version.assessment.title }

        run

        copy = listing.reload.authoring_assessment
        expect(copy.title).to eq(snapshot_title)
        expect(copy.questions.count).to eq(1)
      end

      # Restoring maintenance access is not a course adopting the content.
      it 'records no adoption' do
        expect { run }.not_to change(Course::Assessment::Marketplace::Adoption, :count)
      end

      # Same reason the adopted copy is detached: without this the restored copy, the container
      # snapshot and every adopter's copy become mutual `linked_assessments`.
      it 'leaves the restored copy in a link tree of its own' do
        run

        copy = listing.reload.authoring_assessment
        expect(copy.linkable_tree_id).to eq(copy.id)
        expect(copy.all_linked_assessments).to contain_exactly(copy)
      end

      # Provenance describes where the content ORIGINALLY came from and when it was taught. A
      # maintenance action must not rewrite those historical facts.
      it 'leaves the provenance fields untouched' do
        provenance = [:source_course_id, :source_course_name, :source_started_at, :source_ended_at]
        before_restore = listing.slice(*provenance)

        run

        expect(listing.reload.slice(*provenance)).to eq(before_restore)
        expect(listing.source_course).to eq(source_course)
      end

      # The end-to-end proof for `#marketplace_hosted?`: the copy lands in the real container, so the
      # admin table can tell a rebuilt listing from one that still has its own source course.
      it 'reports the listing as marketplace-hosted afterwards' do
        expect { run }.to change { listing.reload.marketplace_hosted? }.from(false).to(true)
      end

      it 'leaves the current version untouched — restoring is not a republish' do
        expect { run }.not_to(change { listing.reload.current_version_id })
      end

      it 'lets the listing cut a new version again' do
        run

        expect do
          Course::Assessment::Marketplace::PublishService.publish_new_version(listing.reload, user)
        end.to(change { listing.reload.current_version_id })
      end
    end

    describe 'guards' do
      # `perform_now` cannot be asserted with `raise_error`: TrackableJob installs
      # `rescue_from(StandardError)`, so a refusal surfaces as an errored Job record instead.
      def run_and_capture(target = listing)
        job = described_class.new(target.id, current_user: user)
        job.perform_now
        job.job
      end

      # Completes rather than errors, and rebuilds nothing: the end state this job exists to reach is
      # the one it found. That race is ordinary now that the rebuild is enqueued automatically when an
      # assessment is deleted — a republish can restore the authoring copy while the job sits in the
      # queue — so it must not surface as a failure to whoever is watching.
      it 'leaves a listing that already has an authoring copy alone' do
        listing

        expect { run_and_capture }.not_to(change { container.assessments.count })
        expect(run_and_capture.status).to eq('completed')
      end

      it 'refuses an orphaned listing with no version to restore from' do
        versionless = create(:course_assessment_marketplace_listing, course: source_course)
        versionless.authoring_assessment.destroy!
        versionless.reload

        expect { run_and_capture(versionless) }.
          not_to(change { container.assessments.count })
        expect(run_and_capture(versionless).status).to eq('errored')
      end
    end
  end
end
