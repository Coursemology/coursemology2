# frozen_string_literal: true
require 'rails_helper'

# The clone itself is `RestoreAuthoringService`'s contract and is covered there. What is job-level —
# and only testable here — is the guarding it does around a repair that may run long after it was
# asked for, and the url it hands back for the client to follow.
RSpec.describe Course::Assessment::Marketplace::RestoreAuthoringJob, type: :job do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
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
    # transaction: the column is nulled underneath the model layer, as the foreign key does when a
    # delete bypasses the callback. That is the state this job exists to repair.
    def orphan!(target = listing)
      target.update_column(:authoring_assessment_id, nil)
      target.reload
    end

    # `perform_now` cannot be asserted with `raise_error`: TrackableJob installs
    # `rescue_from(StandardError)`, so a refusal surfaces as an errored Job record instead.
    def run(target = listing)
      job = described_class.new(target.id, current_user: user)
      job.perform_now
      job.job
    end

    context 'when the listing is orphaned with a version' do
      before { orphan! }

      it 'rebuilds the authoring copy in the container' do
        expect { run }.to change { container_assessment_count }.by(1)
        expect(listing.reload).not_to be_orphaned
      end

      # The client follows this after polling. It carries the CONTAINER's own host: the copy lives in
      # the preview instance, so a relative path would resolve on nobody's host but the admin's.
      it 'completes with a redirect url on the container instance' do
        job = run

        copy = ActsAsTenant.without_tenant { listing.reload.authoring_assessment }
        expect(job.status).to eq('completed')
        expect(job.redirect_to).to include(container.instance.host)
        expect(job.redirect_to).to include("/assessments/#{copy.id}")
      end
    end

    describe 'guards' do
      # Completes rather than errors, and rebuilds nothing: the end state this job exists to reach is
      # the one it found. A republish restores an authoring copy on its own and can land between
      # enqueue and perform, so that race must not surface as a failure to whoever is watching.
      it 'leaves a listing that already has an authoring copy alone' do
        listing

        expect { run }.not_to(change { container_assessment_count })
        expect(run.status).to eq('completed')
      end

      it 'refuses an orphaned listing with no version to restore from' do
        versionless = create(:course_assessment_marketplace_listing, course: source_course)
        orphan!(versionless)

        expect { run(versionless) }.not_to(change { container_assessment_count })
        expect(run(versionless).status).to eq('errored')
      end
    end
  end
end
