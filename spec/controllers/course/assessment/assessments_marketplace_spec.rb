# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::AssessmentsController, type: :controller do
  render_views
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    let(:admin) { create(:administrator) }

    describe 'GET #show — marketplace fields' do
      context 'as a system admin' do
        before { controller_sign_in(controller, admin) }

        it 'grants the publish permission and reports not-yet-published' do
          get :show, as: :json, params: { course_id: course, id: assessment }
          body = JSON.parse(response.body)
          expect(body['permissions']).to include('canPublishToMarketplace' => true)
          expect(body).to include('isPublishedToMarketplace' => false)
          expect(body['marketplaceListingUrl']).to be_present
        end

        it 'reports isPublishedToMarketplace true once a published listing exists' do
          create(:course_assessment_marketplace_listing, authoring_assessment: assessment, published: true)
          get :show, as: :json, params: { course_id: course, id: assessment }
          expect(JSON.parse(response.body)).to include('isPublishedToMarketplace' => true)
        end
      end

      describe 'marketplaceUpdate' do
        let(:destination_course) { create(:course) }
        let(:manager) { create(:course_manager, course: destination_course).user }
        let(:copy) { create(:assessment, course: destination_course) }
        let(:v1_at) { 10.days.ago.change(usec: 0) }
        let(:v2_at) { 1.day.ago.change(usec: 0) }
        let(:listing) do
          create(:course_assessment_marketplace_listing, :versioned,
                 published: true, first_published_at: v1_at)
        end

        before { controller_sign_in(controller, manager) }

        subject do
          get :show, params: { course_id: destination_course.id, id: copy.id, format: :json }
        end

        it 'is null for an assessment that was never adopted' do
          subject

          expect(response.parsed_body['marketplaceUpdate']).to be_nil
        end

        it 'carries the notice when a newer version exists' do
          create(:course_assessment_marketplace_adoption,
                 listing: listing, destination_course: destination_course,
                 duplicated_assessment: copy, adopted_version_at: v1_at)
          v2 = create(:course_assessment_marketplace_listing_version,
                      listing: listing,
                      assessment: create(:assessment, course: listing.authoring_assessment.course),
                      published_at: v2_at, published_by: listing.publisher)
          listing.update!(current_version: v2)

          subject

          notice = response.parsed_body['marketplaceUpdate']
          expect(notice.keys).to contain_exactly('adoptedVersionAt', 'latestVersionAt',
                                                 'canUpdateInPlace', 'testSubmissionCount')
          expect(Time.zone.parse(notice['adoptedVersionAt'])).to be_within(1.second).of(v1_at)
          expect(Time.zone.parse(notice['latestVersionAt'])).to be_within(1.second).of(v2_at)
        end
      end

      context 'as a course manager (non-admin)' do
        let(:manager) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, manager) }

        it 'withholds the publish permission' do
          get :show, as: :json, params: { course_id: course, id: assessment }
          expect(JSON.parse(response.body)['permissions']).to include('canPublishToMarketplace' => false)
        end
      end
    end

    # Opening a container assessment must carry the identity its index row carries. Without it the
    # snapshot, the listing's working copy and an ordinary draft are three indistinguishable pages —
    # and the snapshot's lone marketplace control invites republishing immutable content as a listing
    # of its own, whose source assessment would then be frozen inside the container.
    describe 'GET #show — marketplace container context' do
      let(:container) { create(:course, preview: true) }
      let(:listing) do
        create(:course_assessment_marketplace_listing, course: container,
                                                       source_course_name: 'MP Allowlist Source Course')
      end
      let(:working_copy) { listing.authoring_assessment }
      let(:snapshot) { create(:assessment, course: container) }
      let(:published_at) { 3.days.ago.change(usec: 0) }
      let!(:version) do
        create(:course_assessment_marketplace_listing_version,
               listing: listing, assessment: snapshot, published_at: published_at,
               published_by: listing.publisher).tap { |cut| listing.update!(current_version: cut) }
      end

      def show_for(target_course, target_assessment)
        get :show, as: :json, params: { course_id: target_course.id, id: target_assessment.id }
      end

      context 'as a system admin' do
        before { controller_sign_in(controller, admin) }

        it 'dates a snapshot with the same fields as its index row' do
          show_for(container, snapshot)

          label = response.parsed_body['marketplaceVersion']
          expect(label.keys).to contain_exactly('listingId', 'publishedAt', 'source', 'latest',
                                                'listed')
          expect(label['listingId']).to eq(listing.id)
          expect(label['source']).to eq('MP Allowlist Source Course')
          expect(label['latest']).to be(true)
          expect(label['listed']).to be(true)
          expect(Time.zone.parse(label['publishedAt'])).to be_within(1.second).of(published_at)
        end

        it 'reports the working copy as a non-version' do
          show_for(container, working_copy)

          label = response.parsed_body['marketplaceVersion']
          expect(label['listingId']).to eq(listing.id)
          expect(label['publishedAt']).to be_nil
          expect(label['latest']).to be(false)
        end

        it 'withholds publishing from a snapshot, which is already an existing listing content' do
          show_for(container, snapshot)

          expect(response.parsed_body['permissions']).to include('canPublishToMarketplace' => false)
        end

        it 'keeps publishing available on the working copy' do
          show_for(container, working_copy)

          expect(response.parsed_body['permissions']).to include('canPublishToMarketplace' => true)
        end

        # An assessment authored directly in the container is neither a snapshot nor a working copy.
        # Publishing it is the supported way a marketplace-hosted listing comes to exist at all.
        it 'keeps publishing available on an unlabelled container assessment' do
          fresh = create(:assessment, course: container)

          show_for(container, fresh)

          expect(response.parsed_body).not_to have_key('marketplaceVersion')
          expect(response.parsed_body['permissions']).to include('canPublishToMarketplace' => true)
        end

        # The guard is the container's `preview` flag, mirroring the index: the same assessment
        # outside the container must stay unlabelled.
        it 'omits the context outside the container, even for a versioned assessment' do
          in_normal_course = create(:assessment, course: course)
          create(:course_assessment_marketplace_listing_version,
                 listing: listing, assessment: in_normal_course, published_at: 2.days.ago,
                 published_by: listing.publisher)

          show_for(course, in_normal_course)

          expect(response.parsed_body).not_to have_key('marketplaceVersion')
        end
      end

      # Previewers are enrolled into the container as managers. The context is admin-only navigation,
      # exactly as on the index.
      context 'as a non-admin manager of the container' do
        before { controller_sign_in(controller, create(:course_manager, course: container).user) }

        it 'omits the context' do
          show_for(container, snapshot)

          expect(response.parsed_body).not_to have_key('marketplaceVersion')
        end
      end
    end

    describe 'version identity in the assessment payloads' do
      render_views

      let(:destination_course) { create(:course) }
      let(:manager) { create(:course_manager, course: destination_course).user }
      let(:copy) { create(:assessment, course: destination_course) }
      let(:v1_at) { 30.days.ago.change(usec: 0) }
      let(:listing) do
        create(:course_assessment_marketplace_listing, published: true, first_published_at: v1_at)
      end

      before do
        version = create(:course_assessment_marketplace_listing_version,
                         listing: listing,
                         assessment: create(:assessment, course: listing.authoring_assessment.course),
                         published_at: v1_at, published_by: listing.publisher)
        listing.update!(current_version: version)
        controller_sign_in(controller, manager)
      end

      it 'dates both vintages on the update notice and carries no ordinal' do
        create(:course_assessment_marketplace_adoption,
               listing: listing, destination_course: destination_course,
               duplicated_assessment: copy, adopted_version_at: v1_at)
        latest = create(:course_assessment_marketplace_listing_version,
                        listing: listing,
                        assessment: create(:assessment, course: listing.authoring_assessment.course),
                        published_at: 1.day.ago.change(usec: 0), published_by: listing.publisher)
        listing.update!(current_version: latest)

        get :show, as: :json, params: { course_id: destination_course, id: copy }

        update = response.parsed_body['marketplaceUpdate']
        expect(update.keys).to contain_exactly('adoptedVersionAt', 'latestVersionAt',
                                               'canUpdateInPlace', 'testSubmissionCount')
        expect(Time.zone.parse(update['adoptedVersionAt'])).to be_within(1.second).of(v1_at)
        expect(Time.zone.parse(update['latestVersionAt'])).
          to be_within(1.second).of(latest.published_at)
      end

      it 'emits a null update notice when the copy is current' do
        create(:course_assessment_marketplace_adoption,
               listing: listing, destination_course: destination_course,
               duplicated_assessment: copy, adopted_version_at: v1_at)

        get :show, as: :json, params: { course_id: destination_course, id: copy }

        expect(response.parsed_body['marketplaceUpdate']).to be_nil
      end
    end

    describe 'the in-place update gate on the show payload' do
      render_views

      let(:destination_course) { create(:course) }
      let(:manager) { create(:course_manager, course: destination_course).user }
      let(:copy) { create(:assessment, :with_mcq_question, course: destination_course) }
      let(:v1_at) { 30.days.ago.change(usec: 0) }
      let(:listing) do
        create(:course_assessment_marketplace_listing, published: true, first_published_at: v1_at)
      end

      before do
        version = create(:course_assessment_marketplace_listing_version,
                         listing: listing,
                         assessment: create(:assessment, course: listing.authoring_assessment.course),
                         published_at: v1_at, published_by: listing.publisher)
        listing.update!(current_version: version)
        create(:course_assessment_marketplace_adoption,
               listing: listing, destination_course: destination_course,
               duplicated_assessment: copy, adopted_version_at: v1_at)
        newer = create(:course_assessment_marketplace_listing_version,
                       listing: listing,
                       assessment: create(:assessment, course: listing.authoring_assessment.course),
                       published_at: 1.day.ago.change(usec: 0), published_by: listing.publisher)
        listing.update!(current_version: newer)
        controller_sign_in(controller, manager)
      end

      it 'offers the in-place update on an unattempted copy' do
        get :show, as: :json, params: { course_id: destination_course, id: copy }

        update = response.parsed_body['marketplaceUpdate']
        expect(update['canUpdateInPlace']).to be(true)
        expect(update['testSubmissionCount']).to eq(0)
      end

      it 'withholds the in-place update once a real student has attempted the copy' do
        create(:submission, :attempting, assessment: copy,
                                         creator: create(:course_student, course: destination_course).user)

        get :show, as: :json, params: { course_id: destination_course, id: copy }

        expect(response.parsed_body['marketplaceUpdate']['canUpdateInPlace']).to be(false)
      end
    end
  end
end
