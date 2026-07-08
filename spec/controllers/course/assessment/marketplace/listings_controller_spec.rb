# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::ListingsController, type: :controller do
  render_views # index.json.jbuilder output is asserted below — controller specs don't render views otherwise

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:manager) { create(:course_manager, course: course) }

    before { controller_sign_in(controller, manager.user) }

    describe 'GET #index' do
      let!(:published) { create(:course_assessment_marketplace_listing, published: true) }
      let!(:unpublished) { create(:course_assessment_marketplace_listing, published: false) }

      it 'returns only published listings' do
        get :index, params: { course_id: course, format: :json }
        ids = response.parsed_body['listings'].map { |l| l['id'] }
        expect(ids).to include(published.id)
        expect(ids).not_to include(unpublished.id)
      end

      it 'includes title, question count and adoptions, and canAccess' do
        get :index, params: { course_id: course, format: :json }
        expect(response.parsed_body['canAccess']).to be(true)
        row = response.parsed_body['listings'].find { |l| l['id'] == published.id }
        expect(row).to include('title', 'questionCount', 'adoptions', 'previewUrl', 'duplicateUrl')
      end

      it 'reports the live distinct-course adoption count' do
        listing = create(:course_assessment_marketplace_listing, published: true)
        create(:course_assessment_marketplace_adoption, listing: listing, destination_course: create(:course))
        get :index, params: { course_id: course, format: :json }
        row = response.parsed_body['listings'].find { |l| l['id'] == listing.id }
        expect(row['adoptions']).to eq(1)
      end

      it 'reports the actual question count for a listing (not the 0 fallback)' do
        assessment_with_questions = create(:assessment, :with_mcq_question, question_count: 3, course: course)
        listing = create(:course_assessment_marketplace_listing, published: true, assessment: assessment_with_questions)
        get :index, params: { course_id: course, format: :json }
        row = response.parsed_body['listings'].find { |l| l['id'] == listing.id }
        expect(row['questionCount']).to eq(3)
      end

      context 'as a student' do
        let(:student) { create(:course_student, course: course).user }
        before { controller_sign_in(controller, student) }
        it 'is forbidden' do
          expect do
            get :index, params: { course_id: course, format: :json }
          end.to raise_exception(CanCan::AccessDenied)
        end
      end
    end
    describe 'POST #duplicate' do
      # `have_enqueued_job` requires the :test adapter; the test env defaults to :background_thread.
      # `run_rescue` re-enables handle_access_denied so AccessDenied renders 403 rather than
      # propagating (controller specs bypass_rescue by default — see spec/support/controller_exceptions.rb).
      run_rescue

      with_active_job_queue_adapter(:test) do
        let!(:listing) { create(:course_assessment_marketplace_listing, published: true) }
        let!(:tab) { course.assessment_categories.first.tabs.first }

        it 'enqueues a duplication job with the destination course + tab' do
          expect do
            post :duplicate, params: {
              course_id: course, listing_ids: [listing.id], destination_tab_id: tab.id, format: :json
            }
          end.to have_enqueued_job(Course::Assessment::Marketplace::DuplicationJob).
            with([listing.id], course, tab.id, current_user: manager.user)
          expect(response.parsed_body['jobUrl']).to be_present
        end

        context 'when the listing is unpublished' do
          let!(:listing) { create(:course_assessment_marketplace_listing, published: false) }
          it 'is forbidden and enqueues nothing' do
            expect do
              post :duplicate, params: {
                course_id: course, listing_ids: [listing.id], destination_tab_id: tab.id, format: :json
              }
            end.not_to have_enqueued_job(Course::Assessment::Marketplace::DuplicationJob)
            expect(response).to have_http_status(:forbidden)
          end
        end

        context 'when no matching published listing exists (empty/unknown ids)' do
          it 'is forbidden (renders 403 on the empty set)' do
            post :duplicate, params: {
              course_id: course, listing_ids: [-1], destination_tab_id: tab.id, format: :json
            }
            expect(response).to have_http_status(:forbidden)
          end
        end
      end
    end
  end

  # Cross-instance: a listing published in another instance is visible.
  describe 'cross-instance visibility' do
    let(:other_instance) { create(:instance) }
    let(:home_instance) { create(:instance) }

    it 'lists listings from other instances' do
      foreign = ActsAsTenant.with_tenant(other_instance) do
        create(:course_assessment_marketplace_listing, published: true)
      end
      ActsAsTenant.with_tenant(home_instance) do
        course = create(:course)
        manager = create(:course_manager, course: course)
        controller_sign_in(controller, manager.user)
        # Point the request at the home instance's host so `deduce_tenant` resolves it (this
        # describe is outside `with_tenant`, which would otherwise set the host header for us).
        @request.headers['host'] = home_instance.host
        get :index, params: { course_id: course, format: :json }
        ids = response.parsed_body['listings'].map { |l| l['id'] }
        expect(ids).to include(foreign.id)
      end
    end
  end
end
