# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::MarketplaceListingsController, type: :controller do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    let(:admin) { create(:administrator) }

    before { controller_sign_in(controller, admin) }

    describe 'POST #create' do
      subject { post :create, params: { course_id: course, assessment_id: assessment, format: :json } }

      it 'creates a published listing' do
        expect { subject }.to change { Course::Assessment::Marketplace::Listing.count }.by(1)
        listing = assessment.reload.marketplace_listing
        expect(listing.published).to be(true)
        expect(listing.first_published_at).to be_present
        expect(listing.last_published_at).to be_present
        expect(listing.publisher).to eq(admin)
      end

      it 'cuts version 1 through the publish seam' do
        expect { subject }.to change { Course::Assessment::Marketplace::ListingVersion.count }.by(1)
        listing = assessment.reload.marketplace_listing
        expect(listing.current_version&.version).to eq(1)
        expect(listing.current_version.published_by).to eq(admin)
      end

      context 'when the assessment was previously published then removed (re-publish)' do
        let!(:listing) do
          create(:course_assessment_marketplace_listing, assessment: assessment, published: false,
                                                         first_published_at: 3.days.ago, last_published_at: 3.days.ago)
        end

        it 'reuses the existing row, preserves first_published_at, bumps last_published_at' do
          original_first = listing.first_published_at
          expect { subject }.not_to(change { Course::Assessment::Marketplace::Listing.count })
          listing.reload
          expect(listing.published).to be(true)
          expect(listing.first_published_at).to be_within(1.second).of(original_first) # NOT overwritten
          expect(listing.last_published_at).to be > original_first                     # bumped to now
        end
      end

      context 'when the user is a course manager (can read but not an admin)' do
        let(:manager) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, manager) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe 'DELETE #destroy' do
      let!(:listing) { create(:course_assessment_marketplace_listing, assessment: assessment, published: true) }

      it 'soft-removes: keeps the row, sets published false' do
        delete :destroy, params: { course_id: course, assessment_id: assessment, format: :json }
        expect(listing.reload.published).to be(false)
        expect(Course::Assessment::Marketplace::Listing.exists?(listing.id)).to be(true)
      end

      context 'when the assessment has no marketplace listing' do
        let(:unlisted_assessment) { create(:assessment, course: course) }

        it 'responds unprocessable' do
          delete :destroy, params: { course_id: course, assessment_id: unlisted_assessment, format: :json }
          expect(response).to have_http_status(:unprocessable_content)
        end
      end

      context 'when the user is a course manager (can read but not an admin)' do
        let(:manager) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, manager) }
        it 'is forbidden and leaves the listing published' do
          expect do
            delete :destroy, params: { course_id: course, assessment_id: assessment, format: :json }
          end.to raise_exception(CanCan::AccessDenied)
          expect(listing.reload.published).to be(true)
        end
      end
    end
  end
end
