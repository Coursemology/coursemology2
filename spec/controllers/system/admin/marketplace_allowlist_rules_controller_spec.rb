# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::MarketplaceAllowlistRulesController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    before { controller_sign_in(controller, admin) }

    describe 'POST #create' do
      # Email-domain rules are unique per domain and specs commit, so the row this example creates
      # would collide with itself on the next run. Clear it first.
      before do
        Course::Assessment::Marketplace::AllowlistRule.
          rule_type_email_domain.where(email_domain: 'schools.gov.sg').delete_all
      end

      subject do
        post :create, format: :json, params: {
          allowlist_rule: { rule_type: 'email_domain', email_domain: 'schools.gov.sg' }
        }
      end

      it 'creates an email-domain rule' do
        expect { subject }.
          to change { Course::Assessment::Marketplace::AllowlistRule.count }.by(1)
        expect(response).to have_http_status(:ok)
      end
    end

    describe 'POST #create for a user rule by email' do
      render_views
      # No transactional fixtures / DatabaseCleaner here (see GET #index note), so a user with this
      # hardcoded email can persist from an earlier run and collide on email uniqueness. Clear it.
      before { User::Email.where(email: 'teacher@school.edu').delete_all }

      it 'resolves a confirmed email to the owning user and creates a user rule' do
        target = create(:user, email: 'teacher@school.edu')
        expect do
          post :create, format: :json, params: {
            allowlist_rule: { rule_type: 'user', email: 'teacher@school.edu' }
          }
        end.to change { Course::Assessment::Marketplace::AllowlistRule.rule_type_user.count }.by(1)
        expect(response).to have_http_status(:ok)
        expect(Course::Assessment::Marketplace::AllowlistRule.rule_type_user.last.user).to eq(target)
      end

      it 'serializes the resolved user\'s email as userEmail in the rendered rule' do
        create(:user, email: 'teacher@school.edu')
        post :create, format: :json, params: {
          allowlist_rule: { rule_type: 'user', email: 'teacher@school.edu' }
        }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['userEmail']).to eq('teacher@school.edu')
      end

      it 'rejects an email that matches no user' do
        expect do
          post :create, format: :json, params: {
            allowlist_rule: { rule_type: 'user', email: 'nobody@nowhere.test' }
          }
        end.not_to(change { Course::Assessment::Marketplace::AllowlistRule.count })
        expect(response).to have_http_status(:bad_request)
        expect(response.parsed_body['errors']).to include('No user with that email.')
      end
    end

    describe 'GET #index' do
      render_views
      # This suite runs with `use_transactional_fixtures = false` and no DatabaseCleaner, so rows
      # created by earlier local runs of this factory persist in the dev/test DB; scope to a clean
      # slate here so the size assertion below is deterministic.
      before do
        Course::Assessment::Marketplace::AllowlistRule.delete_all
        create(:course_assessment_marketplace_allowlist_rule, :for_email_domain)
      end

      it 'lists the rules' do
        get :index, format: :json
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['rules'].size).to eq(1)
      end
    end

    describe 'GET #index everyone-mode reporting' do
      render_views
      before do
        Course::Assessment::Marketplace::AllowlistRule.delete_all
        create(:course_assessment_marketplace_allowlist_rule, :for_email_domain)
      end

      it 'reports everyoneRuleId null and lists only scoped rules when no everyone rule exists' do
        get :index, format: :json
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['everyoneRuleId']).to be_nil
        expect(response.parsed_body['rules'].size).to eq(1)
      end

      it 'reports everyoneRuleId and excludes the everyone rule from the list' do
        everyone = create(:course_assessment_marketplace_allowlist_rule, :everyone)
        get :index, format: :json
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['everyoneRuleId']).to eq(everyone.id)
        expect(response.parsed_body['rules'].map { |r| r['ruleType'] }).not_to include('everyone')
        expect(response.parsed_body['rules'].size).to eq(1)
      end
    end

    describe "POST #create with rule_type 'everyone'" do
      before { Course::Assessment::Marketplace::AllowlistRule.delete_all }

      it 'opens the marketplace to everyone' do
        expect do
          post :create, format: :json, params: { allowlist_rule: { rule_type: 'everyone' } }
        end.to change { Course::Assessment::Marketplace::AllowlistRule.rule_type_everyone.count }.by(1)
        expect(response).to have_http_status(:ok)
      end

      it 'rejects a second everyone rule' do
        create(:course_assessment_marketplace_allowlist_rule, :everyone)
        expect do
          post :create, format: :json, params: { allowlist_rule: { rule_type: 'everyone' } }
        end.not_to(change { Course::Assessment::Marketplace::AllowlistRule.count })
        expect(response).to have_http_status(:bad_request)
      end

      it 'surfaces the uniqueness error when rejected' do
        create(:course_assessment_marketplace_allowlist_rule, :everyone)
        post :create, format: :json, params: { allowlist_rule: { rule_type: 'everyone' } }
        expect(response.parsed_body['errors']).to include('already been taken')
      end
    end

    describe 'DELETE #destroy' do
      let!(:rule) { create(:course_assessment_marketplace_allowlist_rule, :for_email_domain) }

      it 'removes the rule' do
        expect { delete :destroy, format: :json, params: { id: rule.id } }.
          to change { Course::Assessment::Marketplace::AllowlistRule.count }.by(-1)
        expect(response).to have_http_status(:ok)
      end
    end

    describe 'authorization' do
      run_rescue

      it 'forbids a non-administrator' do
        controller_sign_in(controller, create(:user))
        get :index, format: :json
        expect(response).to have_http_status(:forbidden)
      end
    end

    describe 'POST #preview' do
      render_views

      before do
        Course::Assessment::Marketplace::AllowlistRule.delete_all
        Course::Assessment::Marketplace::AccessBlock.delete_all
        # LOWER() and no '@' anchor — see the note in Task 1's spec: an anchored, case-sensitive
        # pattern misses rows the `lower(email)` unique index will still collide on.
        User::Email.where('LOWER(email) LIKE ?', '%preview.test').delete_all
      end

      def preview(params)
        post :preview, format: :json, params: { allowlist_rule: params }
      end

      it 'counts eligible staff a domain rule would match, and how many are new' do
        newcomer = create(:user, email: 'newcomer@preview.test')
        create(:course_manager, course: create(:course), user: newcomer)
        existing = create(:user, email: 'existing@preview.test')
        create(:course_manager, course: create(:course), user: existing)
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: existing)

        preview(rule_type: 'email_domain', email_domain: 'preview.test')

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body['matchedCount']).to eq(2)
        expect(body['newCount']).to eq(1)
        expect(body['blockedCount']).to eq(0)
        expect(body['openToEveryone']).to be(false)
        expect(body['users'].map { |u| u['id'] }).to contain_exactly(newcomer.id, existing.id)
        expect(body['users'].find { |u| u['id'] == existing.id }['alreadyHasAccess']).to be(true)
        expect(body['users'].find { |u| u['id'] == newcomer.id }['alreadyHasAccess']).to be(false)
      end

      it 'persists nothing' do
        create(:course_manager, course: create(:course),
                                user: create(:user, email: 'dryrun@preview.test'))

        expect { preview(rule_type: 'email_domain', email_domain: 'preview.test') }.
          not_to(change { Course::Assessment::Marketplace::AllowlistRule.count })
      end

      it 'excludes users who are not baseline-eligible' do
        create(:course_student, course: create(:course),
                                user: create(:user, email: 'student@preview.test'))

        preview(rule_type: 'email_domain', email_domain: 'preview.test')

        expect(response.parsed_body['matchedCount']).to eq(0)
      end

      it 'counts a blocked match but never as new' do
        blocked = create(:user, email: 'blocked@preview.test')
        create(:course_manager, course: create(:course), user: blocked)
        create(:course_assessment_marketplace_access_block, user: blocked)

        preview(rule_type: 'email_domain', email_domain: 'preview.test')

        body = response.parsed_body
        expect(body['matchedCount']).to eq(1)
        expect(body['newCount']).to eq(0)
        # Counted separately from the already-has-access remainder: the UI names the two groups
        # apart, and a blocked user is held back by their own block, not by prior access.
        expect(body['blockedCount']).to eq(1)
        expect(body['users'].first['blocked']).to be(true)
      end

      it 'lists blocked, then already-cleared, then newly granted matches' do
        # Named so the alphabetical order the query starts from is the exact REVERSE of the
        # expected one; without the grouping this example would still pass on a name-sorted list.
        blocked = create(:user, name: 'Zoe Blocked', email: 'zoe@preview.test')
        create(:course_manager, course: create(:course), user: blocked)
        create(:course_assessment_marketplace_access_block, user: blocked)
        existing = create(:user, name: 'Mabel Existing', email: 'mabel@preview.test')
        create(:course_manager, course: create(:course), user: existing)
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: existing)
        newcomer = create(:user, name: 'Adam New', email: 'adam@preview.test')
        create(:course_manager, course: create(:course), user: newcomer)

        preview(rule_type: 'email_domain', email_domain: 'preview.test')

        expect(response.parsed_body['users'].map { |u| u['id'] }).
          to eq([blocked.id, existing.id, newcomer.id])
      end

      it 'reports zero new when the marketplace is already open to everyone' do
        create(:course_manager, course: create(:course),
                                user: create(:user, email: 'open@preview.test'))
        create(:course_assessment_marketplace_allowlist_rule, :everyone)

        preview(rule_type: 'email_domain', email_domain: 'preview.test')

        body = response.parsed_body
        expect(body['openToEveryone']).to be(true)
        expect(body['matchedCount']).to eq(1)
        expect(body['newCount']).to eq(0)
      end

      it 'returns zero matches for a user rule whose target is not eligible' do
        create(:user, email: 'nobody@preview.test') # manages nothing

        preview(rule_type: 'user', email: 'nobody@preview.test')

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['matchedCount']).to eq(0)
      end

      it 'rejects an email matching no user' do
        preview(rule_type: 'user', email: 'ghost@preview.test')

        expect(response).to have_http_status(:bad_request)
        expect(response.parsed_body['errors']).to include('No user with that email.')
      end

      it 'rejects a rule that already exists' do
        create(:course_assessment_marketplace_allowlist_rule,
               rule_type: :email_domain, email_domain: 'preview.test')

        preview(rule_type: 'email_domain', email_domain: 'preview.test')

        expect(response).to have_http_status(:bad_request)
        # Attribute name omitted: StubbedI18nBackend returns the raw key for
        # `activerecord.attributes.*`, so full_messages can never render "Email domain" here.
        expect(response.parsed_body['errors']).to include('already has a rule.')
      end

      it 'denies a non-administrator' do
        controller_sign_in(controller, create(:user))
        expect { preview(rule_type: 'email_domain', email_domain: 'preview.test') }.
          to raise_exception(CanCan::AccessDenied)
      end
    end
  end
end
