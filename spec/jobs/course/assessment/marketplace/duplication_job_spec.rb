# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::DuplicationJob, type: :job do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:source_course) { create(:course) }
    let(:source_assessment) { create(:assessment, :with_mcq_question, course: source_course) }
    let(:listing) { create(:course_assessment_marketplace_listing, assessment: source_assessment, published: true) }
    let(:destination_course) { create(:course) }
    let(:destination_tab) { destination_course.assessment_categories.first.tabs.first }
    let(:user) { create(:administrator) }

    def run
      described_class.perform_now([listing.id], destination_course, destination_tab.id, current_user: user)
    end

    it 'duplicates the assessment into the destination course' do
      expect { run }.to change { destination_course.assessments.count }.by(1)
    end

    it 'lands the copy in the chosen tab' do
      run
      copy = destination_course.assessments.order(:created_at).last
      expect(copy.tab_id).to eq(destination_tab.id)
    end

    it 'writes an adoption row for the copy' do
      expect { run }.to change { Course::Assessment::Marketplace::Adoption.count }.by(1)
      adoption = Course::Assessment::Marketplace::Adoption.last
      expect(adoption.listing).to eq(listing)
      expect(adoption.destination_course).to eq(destination_course)
    end

    it 'counts the same destination course only once across two duplications' do
      run
      run
      expect(listing.reload.adoption_count).to eq(1)
    end

    it 'skips unpublished listings (job re-filters `.published`)' do
      listing.update!(published: false)
      expect { run }.not_to change(destination_course.assessments, :count)
      # Relative, not `Adoption.count == 0`: the duplication path commits outside the example's
      # transaction (rows persist across runs), so only the delta from `run` is meaningful here.
      expect { run }.not_to change(Course::Assessment::Marketplace::Adoption, :count)
    end

    it 'duplicates every listing when given several ids' do
      other = create(:course_assessment_marketplace_listing,
                     assessment: create(:assessment, :with_mcq_question, course: source_course), published: true)
      expect do
        described_class.perform_now([listing.id, other.id], destination_course, destination_tab.id, current_user: user)
      end.to change { destination_course.assessments.count }.by(2).
        and change { Course::Assessment::Marketplace::Adoption.count }.by(2)
    end

    # Grandchildren-excluded: only this job writes adoption rows. A plain course-to-course
    # duplication of an already-adopted copy should not create a second-generation adoption.
    it 'does not write an adoption for an ordinary ObjectDuplicationService copy' do
      run
      copy = destination_course.assessments.order(:created_at).last
      third_course = create(:course)
      expect do
        Course::Duplication::ObjectDuplicationService.duplicate_objects(
          destination_course, third_course, copy, current_user: user
        )
      end.not_to change(Course::Assessment::Marketplace::Adoption, :count)
    end
  end
end
