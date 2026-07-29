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
        expect(listing.current_version).to eq(listing.versions.ordered.first)
        expect(listing.current_version.published_at).to be_within(1.second).of(listing.first_published_at)
        expect(listing.current_version.published_by).to eq(admin)
      end

      context 'when the assessment was previously published then removed (re-publish)' do
        let!(:listing) do
          create(:course_assessment_marketplace_listing, authoring_assessment: assessment, published: false,
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

        # `publisher` no longer moves on re-listing: `PublishService` treats it as who first put the
        # listing up, and it is `publish_version` that records who cut each subsequent version.
        it 'leaves the original publisher in place' do
          original_publisher = listing.publisher
          subject
          expect(listing.reload.publisher).to eq(original_publisher)
        end
      end

      context 'when the user is a course manager (can read but not an admin)' do
        let(:manager) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, manager) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      # A snapshot is an existing listing's published content, not somebody's source assessment.
      # Publishing one would mint a second listing whose source assessment is frozen inside the
      # container, so it can never be edited and no further version can ever be cut from it.
      context 'when the assessment is a published snapshot of another listing' do
        # The container is a per-instance singleton (`index_courses_on_instance_id_one_preview`), and
        # this suite commits, so reuse the row rather than minting a colliding preview course.
        let(:container) { Course.find_by(preview: true) || create(:course, preview: true) }
        let(:assessment) { create(:assessment, course: container) }
        let(:other_listing) { create(:course_assessment_marketplace_listing, course: container) }

        before do
          create(:course_assessment_marketplace_listing_version,
                 listing: other_listing, assessment: assessment, published_at: 1.day.ago,
                 published_by: other_listing.publisher)
        end

        # The snapshot lives in the container, not in the outer `course`, and the controller loads
        # the assessment through the course — so the request has to name the container or it never
        # reaches the guard under test.
        subject do
          post :create, params: { course_id: container, assessment_id: assessment, format: :json }
        end

        it 'refuses rather than minting a second listing' do
          expect { subject }.not_to(change { Course::Assessment::Marketplace::Listing.count })

          expect(response).to have_http_status(:unprocessable_content)
          expect(response.parsed_body['errors']).to be_present
        end
      end
    end

    describe 'POST #publish_version' do
      let!(:listing) { Course::Assessment::Marketplace::PublishService.publish(assessment, admin) }

      subject do
        post :publish_version, params: { course_id: course.id, assessment_id: assessment.id, format: :json }
      end

      it 'cuts the next version and reports it' do
        previous_current_version = listing.current_version

        expect { subject }.to change { listing.reload.versions.count }.by(1)

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body).to have_key('published_at')
        expect(body).not_to have_key('version')
        published_at = Time.zone.parse(body['published_at'])

        listing.reload
        expect(listing.current_version).not_to eq(previous_current_version)
        expect(listing.current_version).to eq(listing.versions.ordered.last)
        expect(listing.current_version.published_at).to be_within(1.second).of(published_at)
      end

      # Relisting is NOT a version cut: `destroy` then `create` reactivates the existing row and
      # keeps serving the old snapshot. Only this action advances the chain.
      it 'is the only path that advances the chain — relisting does not' do
        original_current_version = listing.current_version

        delete :destroy, params: { course_id: course.id, assessment_id: assessment.id, format: :json }

        expect do
          post :create, params: { course_id: course.id, assessment_id: assessment.id, format: :json }
        end.not_to(change { listing.reload.versions.count })

        expect(listing.reload.published).to be(true)
        expect(listing.current_version).to eq(original_current_version)
      end

      context 'when the listing is orphaned' do
        before { listing.update!(authoring_assessment: nil) }

        it 'responds 422 rather than raising' do
          subject

          expect(response).to have_http_status(:unprocessable_content)
          expect(response.parsed_body['errors']).to be_present
        end
      end

      context 'when the user is a course manager (can read but not an admin)' do
        let(:manager) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, manager) }

        it 'is denied by the explicit administrator gate' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
        end
      end
    end

    describe '#publish_version response payload' do
      let(:admin) { create(:administrator) }
      let(:course) { create(:course) }
      let(:assessment) { create(:assessment, course: course) }

      before { controller_sign_in(controller, admin) }

      it 'answers with the new version publish date and no ordinal' do
        Course::Assessment::Marketplace::PublishService.publish(assessment, admin)

        post :publish_version, as: :json, params: { course_id: course, assessment_id: assessment }

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body).to have_key('published_at')
        expect(body).not_to have_key('version')
        expect(Time.zone.parse(body['published_at'])).to be_within(10.seconds).of(Time.zone.now)
      end
    end

    describe 'DELETE #destroy' do
      let!(:listing) do
        create(:course_assessment_marketplace_listing, authoring_assessment: assessment, published: true)
      end

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
