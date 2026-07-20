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
      before { create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: manager.user) }

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

      it 'includes the current course destination tabs with category names' do
        get :index, params: { course_id: course, format: :json }
        tabs = response.parsed_body['destinationTabs']
        expect(tabs).to be_present
        default_tab = course.assessment_categories.first.tabs.first
        row = tabs.find { |tab| tab['id'] == default_tab.id }
        expect(row).to include(
          'id' => default_tab.id,
          'title' => default_tab.title,
          'categoryId' => default_tab.category.id,
          'categoryTitle' => default_tab.category.title
        )
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
    describe 'GET #index visibility gate' do
      subject { get :index, params: { course_id: course.id, format: :json } }

      # The suite runs with `use_transactional_fixtures = false` (see spec/rails_helper.rb), so rows
      # persist across examples/runs. `:everyone` is a DB-enforced singleton (one row allowed), so any
      # leftover row here would either block a later `create(:everyone)` with a uniqueness error or
      # spuriously widen access in a sibling example. Mirrors the cleanup in
      # spec/models/course/assessment/marketplace/allowlist_rule_spec.rb.
      before { Course::Assessment::Marketplace::AllowlistRule.delete_all }

      context 'when the manager is not on the allow-list' do
        before { controller_sign_in(controller, manager.user) }

        it 'denies access' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
        end
      end

      context 'when an allow-list rule matches the manager' do
        before do
          create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: manager.user)
          controller_sign_in(controller, manager.user)
        end

        it 'permits access' do
          expect { subject }.not_to raise_exception
        end
      end

      context 'when the user is a system administrator' do
        let(:admin) { create(:administrator) }
        before do
          create(:course_manager, course: course, user: admin)
          controller_sign_in(controller, admin)
        end

        it 'permits access without an allow-list rule' do
          expect { subject }.not_to raise_exception
        end
      end

      context "when an 'everyone' rule exists" do
        before do
          create(:course_assessment_marketplace_allowlist_rule, :everyone)
          controller_sign_in(controller, manager.user)
        end

        it 'permits a manager who has no matching scoped rule' do
          expect { subject }.not_to raise_exception
        end
      end

      context "when an 'everyone' rule exists but the user is a student" do
        let(:student) { create(:course_student, course: course).user }
        before do
          create(:course_assessment_marketplace_allowlist_rule, :everyone)
          controller_sign_in(controller, student)
        end

        it 'still denies a non-manager (the manager gate holds)' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
        end
      end

      context 'when the user is an observer here but manages another course' do
        let(:roamer) { create(:course_observer, course: course).user }
        before do
          create(:course_manager, course: create(:course), user: roamer)
          create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: roamer)
          controller_sign_in(controller, roamer)
        end

        it 'permits browsing (access is per-person, not per-current-course role)' do
          expect { subject }.not_to raise_exception
        end
      end

      context 'when the user manages another course but is not on the allow-list' do
        let(:roamer) { create(:course_observer, course: course).user }
        before do
          create(:course_manager, course: create(:course), user: roamer)
          controller_sign_in(controller, roamer)
        end

        it 'denies access (allow-list is still required even for a manager elsewhere)' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
        end
      end

      context 'when an allow-listed user manages no course' do
        let(:pupil) { create(:course_student, course: course).user }
        before do
          create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: pupil)
          controller_sign_in(controller, pupil)
        end

        it 'denies access (must manage at least one course)' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
        end
      end

    end

    describe 'POST #duplicate' do
      # `have_enqueued_job` requires the :test adapter; the test env defaults to :background_thread.
      # `run_rescue` re-enables handle_access_denied so AccessDenied renders 403 rather than
      # propagating (controller specs bypass_rescue by default — see spec/support/controller_exceptions.rb).
      run_rescue

      before { create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: manager.user) }

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
    describe 'GET #show (preview)' do
      # `run_rescue` re-enables handle_access_denied so a denied preview renders 403 rather than
      # propagating (controller specs bypass_rescue by default — see spec/support/controller_exceptions.rb).
      run_rescue

      before { create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: manager.user) }

      let!(:listing) do
        assessment = create(:assessment, course: create(:course))
        create(:course_assessment_question_multiple_response, :multiple_choice, assessment: assessment)
        create(:course_assessment_marketplace_listing, assessment: assessment, published: true)
      end

      it 'renders the assessment config read-only' do
        get :show, params: { course_id: course, id: listing.id, format: :json }
        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body).to include('title', 'gradingMode', 'showMcqMrqSolution', 'showRubricToStudents', 'gradedTestCases')
        # The listing preview reports the human-readable question type, matching the per-question chips.
        readable_type = I18n.t('course.assessment.question.multiple_responses.question_type.multiple_choice')
        expect(body['typeCounts']).to include(readable_type => 1)

        question = body['questions'].first
        expect(question).to have_key('staffOnlyComments')
        expect(question['type']).to eq(readable_type)
        expect(question['unautogradable']).to be(false)
        expect(question['mcqMrqType']).to eq('mcq')
        expect(question['options']).to be_present
      end

      it 'includes the current course destination tabs so the duplicate dialog can offer a picker' do
        get :show, params: { course_id: course, id: listing.id, format: :json }
        tabs = response.parsed_body['destinationTabs']
        expect(tabs).to be_present
        default_tab = course.assessment_categories.first.tabs.first
        row = tabs.find { |tab| tab['id'] == default_tab.id }
        expect(row).to include(
          'id' => default_tab.id,
          'title' => default_tab.title,
          'categoryId' => default_tab.category.id,
          'categoryTitle' => default_tab.category.title
        )
      end

      context 'when the listing is unpublished' do
        let!(:listing) { create(:course_assessment_marketplace_listing, published: false) }
        it 'is forbidden' do
          get :show, params: { course_id: course, id: listing.id, format: :json }
          expect(response).to have_http_status(:forbidden)
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
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: manager.user)
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
