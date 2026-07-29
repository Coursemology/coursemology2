# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::AssessmentsController, type: :controller do
  render_views
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    # The container is a per-instance singleton (`index_courses_on_instance_id_one_preview`), and this
    # suite commits, so examples share one row instead of each minting a colliding preview course.
    def preview_container
      Course.find_by(preview: true) || create(:course, preview: true)
    end

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

    # Snapshots keep their original title and share one tab of the container course, so the badge is
    # the only thing distinguishing them. It must stay off every normal course's index (hot path) and
    # away from the previewers who are enrolled into the container as managers.
    describe 'GET #index — marketplace version badge' do
      let(:container) { preview_container }
      let(:snapshot) { create(:assessment, course: container) }
      let(:listing) do
        create(:course_assessment_marketplace_listing, source_course_name: 'MP Allowlist Source Course')
      end
      let(:published_at) { 3.days.ago.change(usec: 0) }
      let(:outside_published_at) { 2.days.ago.change(usec: 0) }
      let!(:version) do
        create(:course_assessment_marketplace_listing_version,
               listing: listing, assessment: snapshot, published_at: published_at,
               published_by: listing.publisher)
      end

      def index_for(target_course)
        get :index, as: :json, params: { course_id: target_course.id }
      end

      def payload_for(target_assessment)
        response.parsed_body['assessments'].find { |json| json['id'] == target_assessment.id }
      end

      context 'as a system admin' do
        before { controller_sign_in(controller, admin) }

        it 'labels a container snapshot with its published date and provenance' do
          index_for(container)

          label = payload_for(snapshot)['marketplaceVersion']
          expect(label.keys).to contain_exactly('listingId', 'publishedAt', 'source', 'latest',
                                                'listed')
          expect(label['listingId']).to eq(listing.id)
          expect(label['source']).to eq('MP Allowlist Source Course')
          expect(Time.zone.parse(label['publishedAt'])).to be_within(1.second).of(published_at)
        end

        # The guard is the container's `preview` flag, not the mere existence of a version row: the
        # same assessment id outside the container must stay unlabelled.
        it 'omits the badge outside the container, even for a versioned assessment' do
          in_normal_course = create(:assessment, course: course)
          create(:course_assessment_marketplace_listing_version,
                 listing: listing, assessment: in_normal_course, published_at: outside_published_at,
                 published_by: listing.publisher)

          index_for(course)

          expect(payload_for(in_normal_course)).not_to have_key('marketplaceVersion')
        end

        it 'does not query listing versions for a normal course' do
          expect(Course::Assessment::Marketplace::ListingVersion).not_to receive(:labels_for_assessments)

          index_for(course)
        end

        it 'marks the served snapshot as the latest' do
          listing.update!(current_version: version)

          index_for(container)

          expect(payload_for(snapshot)['marketplaceVersion']['latest']).to be(true)
        end

        it 'does not mark a superseded snapshot as the latest' do
          pointed_at_snapshot = create(:assessment, course: container)
          pointed_at = create(:course_assessment_marketplace_listing_version,
                              listing: listing, assessment: pointed_at_snapshot, published_at: 1.day.ago,
                              published_by: listing.publisher)
          listing.update!(current_version: pointed_at)

          index_for(container)

          expect(payload_for(snapshot)['marketplaceVersion']['latest']).to be(false)
          expect(payload_for(pointed_at_snapshot)['marketplaceVersion']['latest']).to be(true)
        end

        it 'reports whether the listing is on the marketplace' do
          index_for(container)

          expect(payload_for(snapshot)['marketplaceVersion']['listed']).to be(true)
        end

        it 'reports an unlisted listing as not listed' do
          listing.update!(published: false)

          index_for(container)

          expect(payload_for(snapshot)['marketplaceVersion']['listed']).to be(false)
        end

        it 'flags the container so the client can show its own columns and toolbar' do
          index_for(container)

          expect(response.parsed_body['display']).to include('isMarketplaceContainer' => true)
        end

        # The flag drives a search toolbar and three extra columns. Leaking it into ordinary courses
        # would change the assessments index for every course in the deployment.
        it 'does not flag an ordinary course as the container' do
          index_for(course)

          expect(response.parsed_body['display']).to include('isMarketplaceContainer' => false)
        end
      end

      context 'as a non-admin manager of the container' do
        before { controller_sign_in(controller, create(:course_manager, course: container).user) }

        it 'omits the badge' do
          index_for(container)

          expect(payload_for(snapshot)).not_to have_key('marketplaceVersion')
        end

        it 'does not query listing versions' do
          expect(Course::Assessment::Marketplace::ListingVersion).not_to receive(:labels_for_assessments)

          index_for(container)
        end

        # Previewers are enrolled into the container as managers. They must see neither the badge nor
        # the admin-only navigation the flag switches on.
        it 'does not flag the container' do
          index_for(container)

          expect(response.parsed_body['display']).to include('isMarketplaceContainer' => false)
        end
      end
    end

    # Opening a container assessment must carry the identity its index row carries. Without it the
    # snapshot, the listing's working copy and an ordinary draft are three indistinguishable pages —
    # and the snapshot's lone marketplace control invites republishing immutable content as a listing
    # of its own, whose source assessment would then be frozen inside the container.
    describe 'GET #show — marketplace container context' do
      let(:container) { preview_container }
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
                                                'listed', 'sourceAssessmentUrl')
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

        # The source assessment IS this page, so there is nothing to link to. Key absent, not null,
        # so the banner's trigger never has to special-case it.
        it 'omits the source link on the working copy, which is the page itself' do
          show_for(container, working_copy)

          expect(response.parsed_body['marketplaceVersion']).not_to have_key('sourceAssessmentUrl')
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

        # The one field the index badge never carries. A snapshot is frozen, so the only useful
        # action is to go edit the assessment it was cut from.
        it 'points a snapshot at the assessment it was published from' do
          show_for(container, snapshot)

          expect(response.parsed_body['marketplaceVersion']['sourceAssessmentUrl']).
            to eq("http://#{instance.host}/courses/#{working_copy.course_id}/" \
                  "assessments/#{working_copy.id}")
        end

        # `Instance#host_options` exists for this: a controller's `url_options` always supplies the port the
        # request arrived on, which behind any proxy is not the port the app is served on.
        it 'builds the link on the instance host, not the port the request arrived on' do
          request.host = 'localhost:3999'

          show_for(container, snapshot)

          expect(response.parsed_body['marketplaceVersion']['sourceAssessmentUrl']).
            to start_with("http://#{instance.host}/")
        end

        # The regression `without_tenant` exists for. Viewing a container snapshot means the request
        # is tenanted to the container's instance, so a tenant-scoped `Course` lookup on a source
        # published from elsewhere returns nil rather than raising - dropping the link silently.
        it 'resolves a source assessment published from another instance' do
          origin_instance = create(:instance)
          origin_course = ActsAsTenant.with_tenant(origin_instance) { create(:course) }
          origin_assessment = ActsAsTenant.with_tenant(origin_instance) do
            create(:assessment, course: origin_course)
          end
          cross_listing = create(:course_assessment_marketplace_listing,
                                 authoring_assessment: origin_assessment,
                                 publisher: create(:user))
          cross_snapshot = create(:assessment, course: container)
          create(:course_assessment_marketplace_listing_version,
                 listing: cross_listing, assessment: cross_snapshot,
                 published_at: 2.days.ago.change(usec: 0),
                 published_by: cross_listing.publisher).
            tap { |cut| cross_listing.update!(current_version: cut) }

          show_for(container, cross_snapshot)

          expect(response.parsed_body['marketplaceVersion']['sourceAssessmentUrl']).
            to eq("http://#{origin_instance.host}/courses/#{origin_course.id}/" \
                  "assessments/#{origin_assessment.id}")
        end

        # An orphaned listing has nothing to link at until its rebuild lands. The key is still
        # emitted so the client can tell "no source" from "not a snapshot".
        it 'emits a null link for an orphaned listing, whose source was deleted' do
          orphan_listing = create(:course_assessment_marketplace_listing)
          orphan_snapshot = create(:assessment, course: container)
          create(:course_assessment_marketplace_listing_version,
                 listing: orphan_listing, assessment: orphan_snapshot,
                 published_at: 4.days.ago.change(usec: 0),
                 published_by: orphan_listing.publisher).
            tap { |cut| orphan_listing.update!(current_version: cut) }
          orphan_listing.update!(authoring_assessment: nil)

          show_for(container, orphan_snapshot)

          label = response.parsed_body['marketplaceVersion']
          expect(label).to have_key('sourceAssessmentUrl')
          expect(label['sourceAssessmentUrl']).to be_nil
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

      it 'dates a container snapshot chip by publish date, with no ordinal' do
        container_course = preview_container
        snapshot = create(:assessment, course: container_course)
        listing.current_version.update!(assessment: snapshot)
        controller_sign_in(controller, admin)

        get :index, as: :json, params: { course_id: container_course }

        row = response.parsed_body['assessments'].find { |a| a['id'] == snapshot.id }
        expect(row['marketplaceVersion']).to have_key('publishedAt')
        expect(row['marketplaceVersion']).not_to have_key('version')
        expect(Time.zone.parse(row['marketplaceVersion']['publishedAt'])).
          to be_within(1.second).of(v1_at)
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
