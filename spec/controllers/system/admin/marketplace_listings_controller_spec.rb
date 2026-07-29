# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::MarketplaceListingsController, type: :controller do
  render_views

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    let(:admin) { create(:administrator) }

    # The real container, never `create(:course, preview: true)`: at most one preview course may exist
    # per instance (`index_courses_on_instance_id_one_preview`), and these examples run in
    # `Instance.default` — so a spec minting its own would commit it (specs are not transactional) and
    # every later run would collide with the row the last one left behind.
    def container_course
      ActsAsTenant.without_tenant do
        Course::Assessment::Marketplace::PreviewContainerService.container_course
      end
    end

    # @return [Course::Assessment] an assessment authored directly in the container course
    def assessment_in_container
      container = container_course
      ActsAsTenant.with_tenant(container.instance) { create(:assessment, course: container) }
    end

    # The only way a listing is orphaned now that `Course::Assessment` re-points inside the destroy
    # transaction: the column is nulled underneath the model layer, as
    # `fk_caml_authoring_assessment_id` does when a delete bypasses the callback.
    def orphan!(listing)
      listing.update_column(:authoring_assessment_id, nil)
      listing.reload
    end

    describe 'GET #index' do
      subject { get :index, format: :json }

      before { controller_sign_in(controller, admin) }

      def row_for(listing)
        response.parsed_body['listings'].find { |l| l['id'] == listing.id }
      end

      it 'lists a published listing with its published vintage, provenance and adoption count' do
        listing = Course::Assessment::Marketplace::PublishService.publish(assessment, admin)
        create(:course_assessment_marketplace_adoption, listing: listing)

        subject

        row = row_for(listing)
        expect(row).to have_key('currentVersionPublishedAt')
        expect(row).not_to have_key('currentVersion')
        expect(Time.zone.parse(row['currentVersionPublishedAt'])).
          to be_within(1.second).of(listing.current_version.published_at)
        expect(row['adoptions']).to eq(1)
        expect(row['sourceCourseName']).to eq(course.title)
        expect(row['state']).to eq('published')
      end

      it 'carries the source instance, so two same-named courses can be told apart' do
        listing = Course::Assessment::Marketplace::PublishService.publish(assessment, admin)

        subject

        row = row_for(listing)
        expect(row['sourceInstanceName']).to eq(instance.name)
        expect(row['sourceInstanceHost']).to eq(instance.host)
      end

      # The marketplace is cross-instance while `Course` is `acts_as_tenant :instance`, so a course id
      # resolves ONLY on its own instance's host. A path (or the admin's own host) 404s for every
      # listing published from elsewhere, which is why the url is absolute and carries that host.
      context 'when the source course lives in another instance' do
        let(:other_instance) { create(:instance) }
        let(:other_course) { ActsAsTenant.with_tenant(other_instance) { create(:course) } }
        let(:other_assessment) do
          ActsAsTenant.with_tenant(other_instance) { create(:assessment, course: other_course) }
        end

        it 'builds the authoring url on that instance host' do
          listing = Course::Assessment::Marketplace::PublishService.publish(other_assessment, admin)

          subject

          # Asserted as prefix + suffix rather than one literal: the test env's
          # `default_url_options` injects a port that production does not have.
          url = row_for(listing)['authoringAssessmentUrl']
          expect(url).to start_with("http://#{other_instance.host}")
          expect(url).
            to end_with("/courses/#{other_course.id}/assessments/#{other_assessment.id}")
        end

        it 'reports that instance as the source, not the admin’s own' do
          listing = Course::Assessment::Marketplace::PublishService.publish(other_assessment, admin)

          subject

          row = row_for(listing)
          expect(row['sourceInstanceName']).to eq(other_instance.name)
          expect(row['sourceInstanceHost']).to eq(other_instance.host)
          expect(row['sourceInstanceHost']).not_to eq(instance.host)
        end
      end

      # `Instance#host` carries the port the app is publicly served on, which is not the port the
      # request reached Rails on whenever a proxy sits in front — i.e. every development setup. A
      # controller's `url_options` always supplies `port: request.optional_port`, and Rails reads a
      # port out of `host:` only when no `:port` key is present, so the request's port silently won.
      #
      # Reproduced by moving the request off the instance's port, which is what the proxy does.
      it 'keeps the port carried by the instance host, not the one the request arrived on' do
        listing = Course::Assessment::Marketplace::PublishService.publish(assessment, admin)
        request.host = 'localhost:3999'

        subject

        expect(row_for(listing)['authoringAssessmentUrl']).to start_with("http://#{instance.host}/")
      end

      it 'reports no instance for a listing orphaned before the instance was ever recorded' do
        listing = Course::Assessment::Marketplace::PublishService.publish(assessment, admin)
        listing.update_columns(authoring_assessment_id: nil, source_course_id: nil,
                               source_instance_id: nil)

        subject

        row = row_for(listing)
        expect(row['sourceInstanceName']).to be_nil
        expect(row['sourceInstanceHost']).to be_nil
      end

      it 'serves the snapshot title, not the authoring title' do
        listing = Course::Assessment::Marketplace::PublishService.publish(assessment, admin)
        assessment.update!(title: 'Renamed after publish')

        subject

        expect(row_for(listing)['title']).not_to eq('Renamed after publish')
      end

      it 'flags an unlisted listing' do
        listing = Course::Assessment::Marketplace::PublishService.publish(assessment, admin)
        listing.update!(published: false)

        subject

        expect(row_for(listing)['state']).to eq('unlisted')
      end

      it 'flags a listing orphaned by an assessment deletion and offers no authoring url' do
        listing = Course::Assessment::Marketplace::PublishService.publish(assessment, admin)
        listing.update!(authoring_assessment: nil)

        subject

        row = row_for(listing)
        expect(row['state']).to eq('published')
        expect(row['sourceAssessmentDeleted']).to be(true)
        expect(row['sourceCourseDeleted']).to be(false)
        expect(row['authoringAssessmentUrl']).to be_nil
      end

      # Reported alongside `state` rather than folded into it: the two answer different questions, and
      # the provenance columns keep naming the ORIGIN course even after a rebuild, so this is the only
      # thing in the payload that says where the copy an admin would edit actually lives.
      it 'marks a listing whose authoring copy lives in the container as marketplace-hosted' do
        listing = Course::Assessment::Marketplace::PublishService.
                  publish(assessment_in_container, admin)

        subject

        expect(row_for(listing)['marketplaceHosted']).to be(true)
        expect(row_for(listing)['state']).to eq('published')
      end

      it 'does not mark a listing whose authoring copy is in an ordinary course' do
        listing = Course::Assessment::Marketplace::PublishService.publish(assessment, admin)

        subject

        expect(row_for(listing)['marketplaceHosted']).to be(false)
      end

      # The whole origin course went, so the FK nullified `source_course_id` too. Identifiable
      # provenance differs from a plain assessment deletion, which is why it is its own boolean.
      it 'flags a listing orphaned by a course deletion' do
        listing = Course::Assessment::Marketplace::PublishService.publish(assessment, admin)
        listing.update!(authoring_assessment: nil, source_course: nil)

        subject

        row = row_for(listing)
        expect(row['state']).to eq('published')
        expect(row['sourceAssessmentDeleted']).to be(true)
        expect(row['sourceCourseDeleted']).to be(true)
        expect(row['sourceCourseName']).to eq(course.title)
      end

      it 'reports no deletion facts for a healthy listing with an intact authoring copy' do
        listing = Course::Assessment::Marketplace::PublishService.publish(assessment, admin)

        subject

        row = row_for(listing)
        expect(row['sourceAssessmentDeleted']).to be(false)
        expect(row['sourceCourseDeleted']).to be(false)
      end

      it 'only ever reports published or unlisted as the state' do
        listed = Course::Assessment::Marketplace::PublishService.publish(assessment, admin)
        unlisted = Course::Assessment::Marketplace::PublishService.
                   publish(create(:assessment, course: course), admin)
        unlisted.update!(published: false)

        subject

        expect(row_for(listed)['state']).to eq('published')
        expect(row_for(unlisted)['state']).to eq('unlisted')
        expect(response.parsed_body['listings'].map { |l| l['state'] }.uniq.sort).
          to eq(%w[published unlisted])
      end
    end

    describe 'POST #restore_authoring' do
      # `have_enqueued_job` requires the :test adapter; the test env defaults to :background_thread.
      with_active_job_queue_adapter(:test) do
        let(:listing) { create(:course_assessment_marketplace_listing, :versioned, course: course) }

        before { controller_sign_in(controller, admin) }

        def restore(overrides = {})
          post :restore_authoring, params: { id: listing.id, format: :json }.merge(overrides)
        end

        context 'when the listing is orphaned and versioned' do
          before { orphan!(listing) }

          it 'enqueues the restore job and returns a pollable jobUrl' do
            expect { restore }.
              to have_enqueued_job(Course::Assessment::Marketplace::RestoreAuthoringJob).
              with(listing.id, current_user: admin)
            expect(response.parsed_body['jobUrl']).to be_present
          end

          # No destination is accepted any more: the container is the only destination, so a stray
          # param must not be able to redirect the copy into somebody's live course.
          it 'ignores a destination_course_id param entirely' do
            other_course = create(:course)

            expect { restore(destination_course_id: other_course.id) }.
              to have_enqueued_job(Course::Assessment::Marketplace::RestoreAuthoringJob).
              with(listing.id, current_user: admin)
          end
        end

        it 'rejects a listing that still has its authoring copy' do
          expect { restore }.
            not_to have_enqueued_job(Course::Assessment::Marketplace::RestoreAuthoringJob)
          expect(response).to have_http_status(:unprocessable_content)
          expect(response.parsed_body['errors'].first).to match(/Only an orphaned listing/)
        end

        it 'rejects an orphaned listing with no version to restore from' do
          listing = create(:course_assessment_marketplace_listing, course: course)
          orphan!(listing)

          expect { restore(id: listing.id) }.
            not_to have_enqueued_job(Course::Assessment::Marketplace::RestoreAuthoringJob)
          expect(response).to have_http_status(:unprocessable_content)
          expect(response.parsed_body['errors'].first).to match(/no published version/)
        end
      end
    end

    describe 'DELETE #destroy (permanent purge)' do
      let(:listing) { create(:course_assessment_marketplace_listing, :versioned, course: course) }

      before { controller_sign_in(controller, admin) }

      def purge
        delete :destroy, params: { id: listing.id, format: :json }
      end

      it 'deletes an orphaned listing with no adoptions, along with its snapshots' do
        snapshot = listing.current_version.assessment
        orphan!(listing)

        expect { purge }.
          to change { Course::Assessment::Marketplace::Listing.where(id: listing.id).count }.by(-1).
          and change { Course::Assessment.where(id: snapshot.id).count }.by(-1)
        expect(response).to have_http_status(:ok)
      end

      it 'deletes an unlisted listing with no adoptions, along with its snapshots' do
        snapshot = listing.current_version.assessment
        listing.update!(published: false)

        expect { purge }.
          to change { Course::Assessment::Marketplace::Listing.where(id: listing.id).count }.by(-1).
          and change { Course::Assessment.where(id: snapshot.id).count }.by(-1)
        expect(response).to have_http_status(:ok)
      end

      # Unlisting is the reversible step, so it is the one an admin has to take first.
      it 'refuses a published listing and says to unlist it first' do
        expect { purge }.
          not_to(change { Course::Assessment::Marketplace::Listing.where(id: listing.id).count })
        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body['errors'].first).to match(/Unlist it first/)
      end

      it 'deletes an unlisted listing that has been adopted, along with its adoption rows' do
        adoption = create(:course_assessment_marketplace_adoption, listing: listing)
        duplicated_assessment = adoption.duplicated_assessment
        listing.update!(published: false)

        expect { purge }.
          to change { Course::Assessment::Marketplace::Listing.where(id: listing.id).count }.by(-1).
          and change { Course::Assessment::Marketplace::Adoption.where(id: adoption.id).count }.by(-1)
        expect(response).to have_http_status(:ok)
        # A purge must never reach into another course's content.
        expect(duplicated_assessment.reload).to be_persisted
      end

      it 'deletes an orphaned listing that has been adopted, along with its adoption rows' do
        adoption = create(:course_assessment_marketplace_adoption, listing: listing)
        duplicated_assessment = adoption.duplicated_assessment
        orphan!(listing)

        expect { purge }.
          to change { Course::Assessment::Marketplace::Listing.where(id: listing.id).count }.by(-1).
          and change { Course::Assessment::Marketplace::Adoption.where(id: adoption.id).count }.by(-1)
        expect(response).to have_http_status(:ok)
        expect(duplicated_assessment.reload).to be_persisted
      end
    end

    # The admin-side counterpart of the course-side unlist. It exists separately because that one
    # resolves the listing through its AUTHORING assessment, so it cannot reach an orphaned listing at
    # all — which is precisely the listing an admin most often has to take off the marketplace.
    describe 'PATCH #update (list / unlist)' do
      let(:listing) { create(:course_assessment_marketplace_listing, :versioned, course: course) }

      before { controller_sign_in(controller, admin) }

      def set_published(value, id: listing.id)
        patch :update, params: { id: id, published: value, format: :json }
      end

      it 'unlists a published listing' do
        expect { set_published(false) }.to change { listing.reload.published }.from(true).to(false)
        expect(response).to have_http_status(:ok)
      end

      it 'lists an unlisted listing again, serving the version it already had' do
        version = listing.current_version
        listing.update!(published: false)

        expect { set_published(true) }.to change { listing.reload.published }.from(false).to(true)
        expect(response).to have_http_status(:ok)
        # Re-listing restores VISIBILITY only. It must never cut a version, or an unlist/list round
        # trip would mint a vintage nobody published — same rule PublishService follows.
        expect(listing.current_version).to eq(version)
        expect(listing.versions.count).to eq(1)
      end

      # The case the course-side unlist cannot serve at all.
      it 'unlists an orphaned listing' do
        listing.authoring_assessment.destroy!

        expect { set_published(false) }.to change { listing.reload.published }.from(true).to(false)
        expect(response).to have_http_status(:ok)
      end

      # An orphan goes on serving its snapshot, so there is nothing incoherent about it being listed.
      it 'lists an orphaned listing that still holds a version' do
        listing.authoring_assessment.destroy!
        listing.update!(published: false)

        expect { set_published(true) }.to change { listing.reload.published }.from(false).to(true)
        expect(response).to have_http_status(:ok)
      end

      it 'refuses to list a listing that has never published a version' do
        versionless = create(:course_assessment_marketplace_listing, course: course, published: false)

        expect { set_published(true, id: versionless.id) }.
          not_to(change { versionless.reload.published })
        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body['errors'].first).to match(/no published version/)
      end

      # Nothing else on a listing is the admin's to edit here: provenance is historical fact and the
      # version pointer belongs to the publish path.
      it 'ignores every attribute other than published' do
        expect do
          patch :update, params: { id: listing.id, published: false, title: 'Renamed',
                                   source_course_name: 'Elsewhere', format: :json }
        end.
          not_to(change { listing.reload.source_course_name })
        expect(response).to have_http_status(:ok)
      end
    end

    describe 'GET #show' do
      let(:listing) do
        create(:course_assessment_marketplace_listing, :versioned, course: course,
                                                                   source_course: course,
                                                                   source_instance: instance)
      end

      before { controller_sign_in(controller, admin) }

      def show
        get :show, params: { id: listing.id, format: :json }
      end

      it 'reports provenance, the served vintage and the assessment title' do
        show

        body = response.parsed_body
        expect(response).to have_http_status(:ok)
        expect(body['id']).to eq(listing.id)
        expect(body['title']).to eq(listing.current_version.assessment.title)
        expect(body).to have_key('currentVersionPublishedAt')
        expect(body).not_to have_key('currentVersion')
        expect(Time.zone.parse(body['currentVersionPublishedAt'])).
          to be_within(1.second).of(listing.current_version.published_at)
        expect(body['state']).to eq('published')
        expect(body['sourceInstanceName']).to eq(instance.name)
        expect(body['marketplaceHosted']).to be(false)
      end

      it 'reports a container-hosted authoring copy, matching the index' do
        listing.update!(authoring_assessment: assessment_in_container)

        show

        expect(response.parsed_body['marketplaceHosted']).to be(true)
      end

      it 'lists every version ascending, flagging the current one' do
        v1_at = listing.current_version.published_at
        v2_at = v1_at + 1.day
        v3_at = v1_at + 2.days
        create(:course_assessment_marketplace_listing_version,
               listing: listing, published_at: v3_at, published_by: admin)
        create(:course_assessment_marketplace_listing_version,
               listing: listing, published_at: v2_at, published_by: admin)

        show

        versions = response.parsed_body['versions']
        published_times = versions.map { |version| Time.zone.parse(version['publishedAt']) }
        expect(published_times).to eq(published_times.sort)
        expect(published_times).to all(be_present)
        expect(published_times[0]).to be_within(1.second).of(v1_at)
        expect(published_times[1]).to be_within(1.second).of(v2_at)
        expect(published_times[2]).to be_within(1.second).of(v3_at)
        expect(versions).to all(satisfy { |version| !version.key?('version') })
        # v1 is the current version because the :versioned trait pointed the listing at it.
        expect(versions.map { |v| v['isCurrent'] }).to eq([true, false, false])
      end

      it 'names who published each version' do
        create(:course_assessment_marketplace_listing_version,
               listing: listing, published_at: listing.current_version.published_at + 1.day,
               published_by: admin)

        show

        expect(response.parsed_body['versions'].last['publisherName']).to eq(admin.name)
      end

      it 'dates v1 from the version publish date' do
        published = 4.months.ago.change(usec: 0)
        listing.current_version.update!(published_at: published)

        show

        expect(Time.zone.parse(response.parsed_body['versions'].first['publishedAt'])).
          to be_within(1.second).of(published)
      end

      it 'links each version to its snapshot on the container host' do
        show

        snapshot = listing.current_version.assessment
        url = response.parsed_body['versions'].first['snapshotUrl']
        expect(url).to include("/assessments/#{snapshot.id}")
        expect(url).to start_with('http')
      end

      # Same trap as the authoring url on the index — see the note there.
      it 'keeps the port carried by the container host, not the one the request arrived on' do
        container_host = ActsAsTenant.without_tenant do
          Course::Assessment::Marketplace::PreviewContainerService.container_course.instance.host
        end
        request.host = 'localhost:3999'

        show

        expect(response.parsed_body['versions'].first['snapshotUrl']).
          to start_with("http://#{container_host}/")
      end

      it 'reports adoptions with the vintage each course holds' do
        adopter = create(:course)
        create(:course_assessment_marketplace_adoption, listing: listing,
                                                        destination_course: adopter,
                                                        adopted_version_at: listing.current_version.published_at)

        show

        adoptions = response.parsed_body['adoptions']
        expect(adoptions.size).to eq(1)
        expect(adoptions.first['destinationCourseId']).to eq(adopter.id)
        expect(adoptions.first['destinationCourseName']).to eq(adopter.title)
        expect(adoptions.first).to have_key('adoptedVersionAt')
        expect(adoptions.first).not_to have_key('adoptedVersion')
        expect(Time.zone.parse(adoptions.first['adoptedVersionAt'])).
          to be_within(1.second).of(listing.current_version.published_at)
        expect(adoptions.first['adoptedAt']).to be_present
      end

      it 'reports destination provenance for an adoption in another instance' do
        other_instance = create(:instance)
        other_course = ActsAsTenant.with_tenant(other_instance) { create(:course) }
        ActsAsTenant.with_tenant(other_instance) do
          create(:course_assessment_marketplace_adoption, listing: listing,
                                                          destination_course: other_course,
                                                          adopted_version_at: listing.current_version.published_at)
        end

        show

        adoption = response.parsed_body['adoptions'].first
        expect(adoption['destinationCourseName']).to eq(other_course.title)
        expect(adoption['destinationCourseHost']).to eq(other_instance.host)
      end

      # Unusual but valid, so it reports as an empty list rather than a missing key.
      it 'reports an empty adoptions list when nobody has adopted it' do
        show

        expect(response.parsed_body['adoptions']).to eq([])
      end

      it 'still serves the full history for an orphaned listing' do
        listing.authoring_assessment.destroy!

        show

        body = response.parsed_body
        expect(response).to have_http_status(:ok)
        expect(body['state']).to eq('published')
        expect(body['sourceAssessmentDeleted']).to be(true)
        expect(body['versions'].size).to eq(1)
      end

      # Cannot happen for a published listing, but the page must not 500 if it ever does.
      it 'renders an empty history for a listing with no current version' do
        unversioned = create(:course_assessment_marketplace_listing, course: course)

        get :show, params: { id: unversioned.id, format: :json }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['currentVersionPublishedAt']).to be_nil
        expect(response.parsed_body).not_to have_key('currentVersion')
        expect(response.parsed_body['versions']).to eq([])
      end

      # A course MANAGER, not a student: managers hold a blanket `can :manage, Course` over their own
      # course, so they are the user who proves the `:manage, :all` gate is what stops this.
      it 'denies a course manager' do
        manager = create(:course_manager, course: course).user
        controller_sign_in(controller, manager)

        expect { show }.to raise_exception(CanCan::AccessDenied)
      end
    end

    describe 'authorization' do
      # A course MANAGER, not a student: managers hold a blanket `can :manage, Course` and
      # `can :manage, Course::Assessment` over their own course, so they are the user who proves the
      # `:manage, :all` gate is what stops these actions.
      let(:manager) { create(:course_manager, course: course).user }

      it 'denies a non-administrator' do
        controller_sign_in(controller, create(:course_manager, course: course).user)

        expect { get :index, format: :json }.to raise_exception(CanCan::AccessDenied)
      end

      it 'denies a course manager the restore action' do
        listing = create(:course_assessment_marketplace_listing, :versioned, course: course)
        listing.authoring_assessment.destroy!
        controller_sign_in(controller, manager)

        expect do
          post :restore_authoring, params: { id: listing.id, format: :json }
        end.to raise_exception(CanCan::AccessDenied)
      end

      it 'denies a course manager the unlist' do
        listing = create(:course_assessment_marketplace_listing, :versioned, course: course)
        controller_sign_in(controller, manager)

        expect do
          patch :update, params: { id: listing.id, published: false, format: :json }
        end.to raise_exception(CanCan::AccessDenied)
      end

      it 'denies a course manager the permanent delete' do
        listing = create(:course_assessment_marketplace_listing, :versioned, course: course)
        listing.authoring_assessment.destroy!
        controller_sign_in(controller, manager)

        expect { delete :destroy, params: { id: listing.id, format: :json } }.
          to raise_exception(CanCan::AccessDenied)
      end
    end

    describe 'version identity in the admin payloads' do
      render_views

      let(:admin) { create(:administrator) }
      let(:listing) { create(:course_assessment_marketplace_listing, :versioned, published: true) }

      before { controller_sign_in(controller, admin) }

      it 'names the served vintage on the index, with no ordinal' do
        listing

        get :index, as: :json

        row = response.parsed_body['listings'].find { |l| l['id'] == listing.id }
        expect(row).to have_key('currentVersionPublishedAt')
        expect(row).not_to have_key('currentVersion')
        expect(Time.zone.parse(row['currentVersionPublishedAt'])).
          to be_within(1.second).of(listing.current_version.published_at)
      end

      it 'names each version by publish date on the show page, with no ordinal' do
        get :show, as: :json, params: { id: listing.id }

        version = response.parsed_body['versions'].first
        expect(version).to have_key('publishedAt')
        expect(version).not_to have_key('version')
        expect(version['isCurrent']).to be(true)
      end

      it 'links a version snapshot through its publish date key' do
        get :show, as: :json, params: { id: listing.id }

        expect(response.parsed_body['versions'].first['snapshotUrl']).to be_present
      end

      it 'names the vintage an adopter holds, with no ordinal' do
        adoption = create(:course_assessment_marketplace_adoption,
                          listing: listing,
                          adopted_version_at: listing.current_version.published_at)

        get :show, as: :json, params: { id: listing.id }

        row = response.parsed_body['adoptions'].find { |a| a['id'] == adoption.id }
        expect(row).to have_key('adoptedVersionAt')
        expect(row).not_to have_key('adoptedVersion')
        expect(Time.zone.parse(row['adoptedVersionAt'])).
          to be_within(1.second).of(listing.current_version.published_at)
      end

      # The snapshot map is keyed by a canonicalised timestamp string. An adoption holding exactly
      # the served vintage must therefore resolve to the same snapshot the version row links to.
      it 'resolves the adopter snapshot link from the same key as the version row' do
        create(:course_assessment_marketplace_adoption,
               listing: listing, adopted_version_at: listing.current_version.published_at)

        get :show, as: :json, params: { id: listing.id }

        body = response.parsed_body
        expect(body['adoptions'].first['snapshotUrl']).to eq(body['versions'].first['snapshotUrl'])
      end

      it 'leaves the snapshot link null for an adoption with an unknown vintage' do
        create(:course_assessment_marketplace_adoption,
               listing: listing, adopted_version_at: nil)

        get :show, as: :json, params: { id: listing.id }

        expect(response.parsed_body['adoptions'].first['snapshotUrl']).to be_nil
      end
    end
  end
end
