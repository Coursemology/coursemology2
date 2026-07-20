# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Admin::MarketplaceAccessController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    before do
      Course::Assessment::Marketplace::AllowlistRule.delete_all
      Course::Assessment::Marketplace::AccessBlock.delete_all
      # LOWER() and no '@' anchor: the uniqueness index is on `lower(email)` while SQL LIKE is
      # case-sensitive, so an anchored, case-sensitive pattern leaves rows behind that collide on
      # the next run.
      User::Email.where('LOWER(email) LIKE ?', '%schools.gov.sg').delete_all
      controller_sign_in(controller, admin)
    end

    describe 'GET #index' do
      render_views

      it 'lists eligible users with annotations and a summary' do
        manager = create(:course_manager, course: create(:course))
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: manager.user)

        get :index, format: :json
        expect(response).to have_http_status(:ok)

        row = response.parsed_body['users'].find { |u| u['id'] == manager.user.id }
        expect(row).to be_present
        expect(row['allowedByRules'].map { |r| r['ruleType'] }).to eq(['user'])
        expect(row['courseCount']).to eq(1)
        expect(row['blocked']).to be(false)
        expect(row['systemAdmin']).to be(false)
        # System admins are always listed and always count as having access; the test DB accumulates
        # them across runs (nothing rolls back), so the total is relative to however many exist.
        expect(response.parsed_body['summary']['totalWithAccess']).to eq(1 + User.administrator.count)
        expect(response.parsed_body['summary']['openToEveryone']).to be(false)
      end

      it 'flags a blocked user with a blockId' do
        manager = create(:course_manager, course: create(:course))
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: manager.user)
        block = create(:course_assessment_marketplace_access_block, user: manager.user)

        get :index, format: :json
        row = response.parsed_body['users'].find { |u| u['id'] == manager.user.id }
        expect(row['blocked']).to be(true)
        expect(row['blockId']).to eq(block.id)
        expect(response.parsed_body['summary']['totalWithAccess']).to eq(User.administrator.count)
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
    describe 'GET #index serialization' do
      render_views

      it 'serializes every matching rule with its label, and the blocked total' do
        user = create(:user, email: 'listed@schools.gov.sg')
        create(:course_manager, course: create(:course), user: user)
        user_rule = create(:course_assessment_marketplace_allowlist_rule,
                           rule_type: :user, user: user)
        domain_rule = create(:course_assessment_marketplace_allowlist_rule, :for_email_domain,
                             email_domain: 'schools.gov.sg')
        create(:course_assessment_marketplace_access_block, user: user)

        get :index, format: :json

        expect(response).to have_http_status(:ok)
        row = response.parsed_body['users'].find { |u| u['id'] == user.id }
        expect(row).not_to be_nil
        expect(row['allowedByRules']).to contain_exactly(
          { 'id' => user_rule.id, 'ruleType' => 'user', 'labelValue' => user.name },
          { 'id' => domain_rule.id, 'ruleType' => 'email_domain',
            'labelValue' => 'schools.gov.sg' }
        )
        expect(response.parsed_body['summary']['totalBlocked']).to eq(1)
      end

      it 'serializes an instance rule with the instance name as its label' do
        other_instance = create(:instance)
        user = create(:user)
        ActsAsTenant.with_tenant(other_instance) do
          create(:instance_user, :instructor, user: user, instance: other_instance)
        end
        rule = create(:course_assessment_marketplace_allowlist_rule,
                      rule_type: :instance, instance: other_instance)

        get :index, format: :json

        row = response.parsed_body['users'].find { |u| u['id'] == user.id }
        expect(row['allowedByRules']).to eq(
          ['id' => rule.id, 'ruleType' => 'instance', 'labelValue' => other_instance.name]
        )
      end

      it 'serializes an empty rule list for a user listed only because they are blocked' do
        cu = create(:course_manager, course: create(:course))
        create(:course_assessment_marketplace_access_block, user: cu.user)

        get :index, format: :json

        row = response.parsed_body['users'].find { |u| u['id'] == cu.user.id }
        expect(row['allowedByRules']).to eq([])
        expect(row['blocked']).to be(true)
      end

      it 'serializes a system admin who manages nothing and matches no rule' do
        admin = create(:administrator)

        get :index, format: :json

        row = response.parsed_body['users'].find { |u| u['id'] == admin.id }
        expect(row).not_to be_nil
        expect(row['systemAdmin']).to be(true)
        expect(row['allowedByRules']).to eq([])
        expect(row['courseCount']).to eq(0)
      end
    end
  end
end
