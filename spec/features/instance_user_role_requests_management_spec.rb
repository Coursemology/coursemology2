# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Instance::UserRoleRequests', js: true do
  subject { page }
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:instance_user).user }
    before { login_as(user, scope: :user) }

    context 'As a normal instance user' do
      scenario 'I can create a new role request', type: :mailer do
        visit courses_path
        find('#role-request-button').click

        request = build(:role_request)

        fill_in 'Organization', with: request.organization
        fill_in 'Designation', with: request.designation
        fill_in 'Reason', with: request.reason

        expect do
          find('button.btn-submit').click
          wait_for_page
        end.to change(ActionMailer::Base.deliveries, :count)

        request_created = instance.user_role_requests.last

        expect(request_created).to be_instructor
        expect(request_created.organization).to eq(request.organization)
        expect(request_created.designation).to eq(request.designation)
        expect(request_created.reason).to eq(request.reason)
      end

      scenario 'I can edit my existing role request' do
        request = create(:role_request, user: user, instance: instance)
        visit courses_path
        find('#role-request-button').click

        new_reason = 'New Reason'
        fill_in 'Reason', with: new_reason
        find('button.btn-submit').click
        wait_for_page
        expect(request.reload.reason).to eq(new_reason)
      end
    end

    context 'As an instance admin' do
      let(:user) { create(:instance_administrator).user }
      let!(:requests) { create_list(:role_request, 2, instance: instance) }

      scenario 'I can approve requests' do
        visit instance_user_role_requests_path

        sample_request = requests.sample

        within find("tr.pending_role_request_#{sample_request.id}") do
          find("button.role-request-approve-#{sample_request.id}").click
        end
        expect_toastify("#{sample_request.user.name} has been approved as #{sample_request.role}")

        expect(sample_request.user.instance_users.first.reload.role).to eq(sample_request.role)
      end

      scenario 'I can reject a request' do
        visit instance_user_role_requests_path

        sample_request = requests.sample
        within find("tr.pending_role_request_#{sample_request.id}") do
          find("button.role-request-reject-#{sample_request.id}").click
        end
        accept_prompt

        expect_toastify("The role request made by #{sample_request.user.name} has been rejected.")
        sample_request.reload

        expect(sample_request.workflow_state).to eq('rejected')
        expect(current_path).to eq(admin_instance_admin_path + instance_user_role_requests_path)
        expect(page).to_not have_selector("tr.pending_role_request_#{sample_request.id}")
        expect(page).to have_selector("tr.rejected_role_request_#{sample_request.id}")
      end
    end
  end
end
