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

    # Grandchildren-excluded: an adoption is written for copies of a *listed* assessment, and a copy
    # is never itself listed, so duplicating an already-adopted copy writes no second-generation
    # adoption.
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

    # The sidebar entry point sends no tab, and a tab from another course can be sent by an
    # out-of-date URL. Neither may leave the redirect pointing at a tab the user cannot open.
    describe 'when the requested tab is absent or foreign' do
      def run_with_tab(tab_id)
        job = described_class.new([listing.id], destination_course, tab_id, current_user: user)
        job.perform_now
        job.job
      end

      let(:default_tab) { destination_course.assessment_categories.first.tabs.first }

      it 'lands the copy in the default tab and redirects there when no tab is given' do
        job = run_with_tab(nil)
        copy = destination_course.assessments.order(:created_at).last
        expect(copy.tab_id).to eq(default_tab.id)
        expect(job.redirect_to).to include("tab=#{default_tab.id}", "category=#{default_tab.category_id}")
      end

      it 'ignores a tab belonging to another course' do
        foreign_tab = create(:course).assessment_categories.first.tabs.first
        job = run_with_tab(foreign_tab.id)
        copy = destination_course.assessments.order(:created_at).last
        expect(copy.tab_id).to eq(default_tab.id)
        expect(job.redirect_to).not_to include("tab=#{foreign_tab.id}")
      end
    end

    it 'redirects to the requested tab and its own category' do
      job = described_class.new([listing.id], destination_course, destination_tab.id, current_user: user)
      job.perform_now
      expect(job.job.redirect_to).to include("tab=#{destination_tab.id}", "category=#{destination_tab.category_id}")
    end

    describe 'the listing is not itself duplicated' do
      # Force the listing before the `expect` blocks below: `run` would otherwise create it lazily
      # inside the block and register as a listing-count change of its own.
      before { listing }

      it 'does not create a second listing row' do
        expect { run }.not_to change(Course::Assessment::Marketplace::Listing, :count)
      end

      it 'leaves the duplicated copy unlisted' do
        run
        copy = destination_course.assessments.order(:created_at).last
        expect(copy.marketplace_listing).to be_nil
      end

      it 'holds the listing count steady while adoptions accumulate' do
        other_course = create(:course)
        expect do
          run
          described_class.perform_now([listing.id], other_course,
                                      other_course.assessment_categories.first.tabs.first.id,
                                      current_user: user)
        end.to change { listing.reload.adoption_count }.from(0).to(2).
          and not_change(Course::Assessment::Marketplace::Listing, :count)
      end
    end

    # A listed assessment can leave its course by paths that do not go through this job: an
    # instructor duplicating selected objects, or a full course duplication that carries the
    # listed assessment along. Those copies must obey the same two rules as the job's copies --
    # the listing stays singular, and the destination course is recorded as an adopter.
    describe 'manual duplication of a listed assessment' do
      let(:manual_destination) { create(:course) }

      before { listing }

      def duplicate_selected_objects
        Course::Duplication::ObjectDuplicationService.duplicate_objects(
          source_course, manual_destination, source_assessment, current_user: user
        )
      end

      def duplicate_whole_course
        Course::Duplication::CourseDuplicationService.duplicate_course(
          source_course, current_user: user, new_title: "#{source_course.title} copy"
        )
      end

      context 'when duplicating selected objects' do
        it 'does not create a second listing row' do
          expect { duplicate_selected_objects }.not_to change(Course::Assessment::Marketplace::Listing, :count)
        end

        it 'leaves the manual copy unlisted' do
          copy = duplicate_selected_objects
          expect(copy.marketplace_listing).to be_nil
        end

        it 'records the destination course as an adopter' do
          copy = nil
          expect { copy = duplicate_selected_objects }.
            to change(Course::Assessment::Marketplace::Adoption, :count).by(1)
          adoption = Course::Assessment::Marketplace::Adoption.order(:id).last
          expect(adoption.listing).to eq(listing)
          expect(adoption.destination_course).to eq(manual_destination)
          expect(adoption.duplicated_assessment).to eq(copy)
        end
      end

      context 'when duplicating the whole course' do
        it 'does not create a second listing row' do
          expect { duplicate_whole_course }.not_to change(Course::Assessment::Marketplace::Listing, :count)
        end

        it 'leaves the copied assessment unlisted' do
          new_course = duplicate_whole_course
          expect(new_course.assessments.map(&:marketplace_listing)).to all(be_nil)
        end

        it 'records the new course as an adopter' do
          new_course = nil
          expect { new_course = duplicate_whole_course }.
            to change(Course::Assessment::Marketplace::Adoption, :count).by(1)
          adoption = Course::Assessment::Marketplace::Adoption.order(:id).last
          expect(adoption.listing).to eq(listing)
          expect(adoption.destination_course).to eq(new_course)
        end
      end
    end
  end
end
