# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::Adoption, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    it { is_expected.to belong_to(:listing).class_name('Course::Assessment::Marketplace::Listing') }
    it { is_expected.to belong_to(:destination_course).class_name('Course') }
    it { is_expected.to belong_to(:duplicated_assessment).class_name('Course::Assessment') }

    it 'validates uniqueness of duplicated_assessment_id' do
      existing = create(:course_assessment_marketplace_adoption)
      dup = build(:course_assessment_marketplace_adoption,
                  duplicated_assessment: existing.duplicated_assessment)
      expect(dup).not_to be_valid
    end

    it 'is destroyed when its duplicated assessment is destroyed (DB cascade)' do
      adoption = create(:course_assessment_marketplace_adoption)
      adoption.duplicated_assessment.destroy
      expect(described_class.exists?(adoption.id)).to be(false)
    end

    describe '.update_notice_for' do
      let(:destination_course) { create(:course) }
      let(:copy) { create(:assessment, :with_mcq_question, course: destination_course) }
      let(:v1_at) { 30.days.ago.change(usec: 0) }
      let(:listing) do
        create(:course_assessment_marketplace_listing, published: true, first_published_at: v1_at)
      end
      let!(:v1) do
        version = create(:course_assessment_marketplace_listing_version,
                         listing: listing,
                         assessment: create(:assessment, course: listing.authoring_assessment.course),
                         published_at: v1_at,
                         published_by: listing.publisher)
        listing.update!(current_version: version)
        version
      end

      def cut_version(published_at)
        version = create(:course_assessment_marketplace_listing_version,
                         listing: listing,
                         assessment: create(:assessment, course: listing.authoring_assessment.course),
                         published_at: published_at,
                         published_by: listing.publisher)
        listing.update!(current_version: version)
        version
      end

      def adopt(adopted_version_at:)
        create(:course_assessment_marketplace_adoption,
               listing: listing, destination_course: destination_course,
               duplicated_assessment: copy, adopted_version_at: adopted_version_at)
      end

      it 'returns nil when the assessment was never adopted' do
        expect(described_class.update_notice_for(copy.id)).to be_nil
      end

      it 'returns nil when the adopted vintage is the current one' do
        adopt(adopted_version_at: v1_at)

        expect(described_class.update_notice_for(copy.id)).to be_nil
      end

      it 'returns the notice when a newer vintage exists' do
        adopt(adopted_version_at: v1_at)
        v2 = cut_version(2.days.ago.change(usec: 0))

        notice = described_class.update_notice_for(copy.id)

        expect(notice[:adopted_version_at]).to be_within(1.second).of(v1_at)
        expect(notice[:latest_version_at]).to be_within(1.second).of(v2.published_at)
      end

      # The banner speaks in dates only — there is no ordinal anywhere in the payload.
      it 'carries no version ordinal in the notice' do
        adopt(adopted_version_at: v1_at)
        cut_version(2.days.ago.change(usec: 0))

        notice = described_class.update_notice_for(copy.id)

        expect(notice.keys).to contain_exactly(:adopted_version_at, :latest_version_at,
                                               :can_update_in_place, :test_submission_count)
      end

      it 'dates a mid-chain adopted vintage from the adoption row itself' do
        v2 = cut_version(10.days.ago.change(usec: 0))
        adopt(adopted_version_at: v2.published_at)
        cut_version(1.day.ago.change(usec: 0))

        notice = described_class.update_notice_for(copy.id)

        expect(notice[:adopted_version_at]).to be_within(1.second).of(v2.published_at)
      end

      # Fail toward silence: a false "an update is waiting" trains managers to ignore the banner.
      it 'returns nil when the adopted vintage is unknown, rather than guessing' do
        adopt(adopted_version_at: nil)
        cut_version(2.days.ago.change(usec: 0))

        expect(described_class.update_notice_for(copy.id)).to be_nil
      end

      it 'returns nil when the listing has no current version at all' do
        adoption = adopt(adopted_version_at: v1_at)
        listing.update!(current_version: nil)

        expect(described_class.update_notice_for(adoption.duplicated_assessment_id)).to be_nil
      end

      # An adopter whose copy is somehow NEWER than what the listing serves must not be told an
      # update is waiting — the comparison is strictly greater-than, not merely different.
      it 'returns nil when the adopted vintage is newer than the served one' do
        adopt(adopted_version_at: 1.hour.ago.change(usec: 0))

        expect(described_class.update_notice_for(copy.id)).to be_nil
      end

      it 'resolves when the snapshot lives in another tenant, with no tenant escape' do
        adopt(adopted_version_at: v1_at)
        other_instance = create(:instance)
        published = 1.day.ago.change(usec: 0)
        ActsAsTenant.without_tenant do
          snapshot = ActsAsTenant.with_tenant(other_instance) { create(:assessment) }
          v2 = create(:course_assessment_marketplace_listing_version,
                      listing: listing, assessment: snapshot, published_at: published,
                      published_by: listing.publisher)
          listing.update!(current_version: v2)
        end

        expect(described_class.update_notice_for(copy.id)[:latest_version_at]).
          to be_within(1.second).of(published)
      end

      describe 'the in-place update gate' do
        before do
          adopt(adopted_version_at: v1_at)
          cut_version(2.days.ago.change(usec: 0))
        end

        it 'allows the in-place update when nobody has attempted the copy' do
          notice = described_class.update_notice_for(copy.id)

          expect(notice[:can_update_in_place]).to be(true)
          expect(notice[:test_submission_count]).to eq(0)
        end

        it 'reports the test submissions the update would delete' do
          manager = create(:course_manager, course: destination_course)
          create(:submission, :attempting, assessment: copy, creator: manager.user)

          notice = described_class.update_notice_for(copy.id)

          expect(notice[:can_update_in_place]).to be(true)
          expect(notice[:test_submission_count]).to eq(1)
        end

        it 'refuses the in-place update once a real student has attempted the copy' do
          student = create(:course_student, course: destination_course)
          create(:submission, :attempting, assessment: copy, creator: student.user)

          notice = described_class.update_notice_for(copy.id)

          expect(notice[:can_update_in_place]).to be(false)
        end
      end
    end

    describe '#latest_version_at' do
      let(:listing) { create(:course_assessment_marketplace_listing, :versioned, published: true) }
      let(:adoption) do
        create(:course_assessment_marketplace_adoption, listing: listing,
                                                        adopted_version_at: 1.day.ago)
      end

      it 'reports the served version publish date' do
        expect(adoption.latest_version_at).
          to be_within(1.second).of(listing.current_version.published_at)
      end

      it 'is nil for a listing with no current version' do
        listing.update!(current_version: nil)

        expect(adoption.reload.latest_version_at).to be_nil
      end
    end
  end
end
