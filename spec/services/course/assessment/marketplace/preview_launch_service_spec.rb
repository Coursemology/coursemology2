# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::PreviewLaunchService, type: :service do
  # The listing's own course, and the cross-tenant preview instance/container course, both live
  # under the default tenant for this spec — same shape as PreviewContainerService's spec.
  let!(:default_instance) { Instance.default }

  with_tenant(:default_instance) do
    let(:source_course) { create(:course) }
    let(:source_assessment) { create(:assessment, :with_mcq_question, course: source_course) }
    # Published through the real service rather than the `:versioned` factory trait: that trait parks
    # its stand-in snapshot in the origin's own course, while everything asserted here is about a
    # snapshot that lives in — and is attempted from — the container.
    let(:listing) do
      Course::Assessment::Marketplace::PublishService.publish(source_assessment, source_course.creator)
    end
    let(:user) { create(:user) }
    let(:preview_instance) { Course::Assessment::Marketplace::PreviewContainerService.preview_instance }
    let(:course) { Course::Assessment::Marketplace::PreviewContainerService.container_course }
    let(:snapshot) { listing.current_version.assessment }

    describe '.launch' do
      # The point of the converged design: publishing already placed the snapshot in the container, so
      # launching a preview copies nothing. Duplicating per preview is exactly what would let a
      # preview drift from the copy an adopter's duplicate produces.
      it 'duplicates nothing — it attempts the snapshot that publishing placed in the container' do
        listing # publish before measuring, so the snapshot itself is not counted as the delta

        expect { described_class.launch(listing, user) }.
          not_to(change { course.assessments.count })
      end

      it 'returns the absolute attempt URL for the snapshot on the preview host' do
        url = described_class.launch(listing, user)

        expect(url).to start_with('https://preview.')
        expect(url).to include("/courses/#{course.id}/")
        expect(url).to include("/assessments/#{snapshot.id}/")
        expect(url).to end_with('/attempt')
      end

      it 'attempts the container snapshot, never the authoring copy' do
        url = described_class.launch(listing, user)

        expect(snapshot.course).to eq(course)
        expect(snapshot.id).not_to eq(listing.authoring_assessment_id)
        expect(url).not_to include("/assessments/#{listing.authoring_assessment_id}/")
      end

      it 'enrols the previewer as a manager on first launch' do
        # Force the listing (and its own source course) into existence before the assertion block:
        # creating a course also creates an `owner` CourseUser for its creator, which would otherwise
        # inflate this delta since CourseUser.count is global, not scoped to the container course.
        listing
        user

        expect { described_class.launch(listing, user) }.
          to change { CourseUser.count }.by(1)

        course_user = course.course_users.find_by(user: user)
        expect(course_user).to be_manager
        expect(ActsAsTenant.with_tenant(preview_instance) { InstanceUser.exists?(user: user) }).to be true
      end

      it 'does not re-enrol the previewer on re-launch' do
        described_class.launch(listing, user)

        expect { described_class.launch(listing, user) }.not_to(change { CourseUser.count })
      end

      it 'returns the same attempt URL on re-launch' do
        first = described_class.launch(listing, user)

        expect(described_class.launch(listing, user)).to eq(first)
      end
    end
  end
end
