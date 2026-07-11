# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::PreviewCopyService do
  let(:instance) { create(:instance) }
  around { |ex| ActsAsTenant.with_tenant(instance) { ex.run } }

  let(:source_course) { create(:course, instance: instance) }
  let(:source_assessment) { create(:assessment, :published, course: source_course) }
  let(:listing) { create(:course_assessment_marketplace_listing, assessment: source_assessment) }
  let(:container) do
    Course::Assessment::Marketplace::ContainerCourseService.
      find_or_create!(instance: instance, creator: create(:administrator))
  end
  let(:user) { create(:user) }
  let(:course_user) do
    Course::Assessment::Marketplace::PreviewEnrolmentService.ensure_manager!(course: container, user: user)
  end

  describe '.copy!' do
    it 'creates a copied assessment inside the container as a draft' do
      expect do
        copy = described_class.copy!(listing: listing, container: container,
                                     course_user: course_user, current_user: user)
        expect(copy.course).to eq(container)
        expect(copy).not_to be_published
        expect(copy.tab).to eq(container.assessment_categories.first.tabs.first)
      end.to change { container.assessments.count }.by(1)
    end

    it 'does NOT record a marketplace adoption' do
      expect do
        described_class.copy!(listing: listing, container: container,
                              course_user: course_user, current_user: user)
      end.not_to change(Course::Assessment::Marketplace::Adoption, :count)
    end

    it 'upserts a single Preview marker per (listing, course_user)' do
      described_class.copy!(listing: listing, container: container,
                            course_user: course_user, current_user: user)
      expect do
        described_class.copy!(listing: listing, container: container,
                              course_user: course_user, current_user: user)
      end.not_to change(Course::Assessment::Marketplace::Preview.where(listing: listing, course_user: course_user),
                        :count)
    end

    # The marker is how Task 5 decides whether to resume, so it must survive a re-copy
    # pointing at the newest copy — not at the superseded one, and not destroyed by the
    # `has_one :marketplace_preview, dependent: :destroy` cascade.
    it 'repoints the surviving marker at the newest copy' do
      first = described_class.copy!(listing: listing, container: container,
                                    course_user: course_user, current_user: user)
      second = described_class.copy!(listing: listing, container: container,
                                     course_user: course_user, current_user: user)
      expect(second.id).not_to eq(first.id)

      marker = Course::Assessment::Marketplace::Preview.for(listing, course_user)
      expect(marker).to be_present
      expect(marker.assessment_id).to eq(second.id)
    end
  end
end
