# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Instance::UserRoleRequests' do
  subject { page }
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:instance_user).user }
    before { login_as(user, scope: :user) }

    context 'As a normal instance user' do
      scenario 'I can create a new role request', type: :mailer, js: true do
        visit courses_path
        find('#role-request-button').click

        request = build(:role_request)
        fill_in 'user_role_request[organization]', with: request.organization
        fill_in 'user_role_request[designation]', with: request.designation
        fill_in 'user_role_request[reason]', with: request.reason

        expect { click_button 'create' }.to change(ActionMailer::Base.deliveries, :count)

        request_created = instance.user_role_requests.last

        expect(request_created).to be_instructor
        expect(request_created.organization).to eq(request.organization)
        expect(request_created.designation).to eq(request.designation)
        expect(request_created.reason).to eq(request.reason)
      end

      scenario 'I can edit my existing role request', js: true do
        request = create(:role_request, user: user, instance: instance)
        visit courses_path
        find('#role-request-button').click

        new_reason = 'New Reason'
        fill_in 'user_role_request[reason]', with: new_reason
        click_button 'edit'

        expect(request.reload.reason).to eq(new_reason)
      end

      scenario 'when there is an existing user request, I am redirected to the edit page', js: true do
        request = create(:role_request, user: user, instance: instance)
        visit new_instance_user_role_request_path
        expect(current_path).to eq(edit_instance_user_role_request_path(request))
      end

      scenario 'when I access a approved user request edit page', js: true do
        request = create(:role_request, :approved, user: user, instance: instance)
        visit edit_instance_user_role_request_path(request)
        expect(page).to have_text(I18n.t('instance_user_role_requests.form.role_request_approved'))

        expect(page).to have_field('user_role_request[organization]', visible: false, disabled: true)
        expect(page).to have_field('user_role_request[designation]', visible: false, disabled: true)
        expect(page).to have_field('user_role_request[reason]', visible: false, disabled: true)

        expect(page).not_to have_button(I18n.t('instance_user_role_requests.form.edit_button'))
      end

      scenario 'when I access a rejected user request edit page', js: true do
        request = create(:role_request, :rejected, user: user, instance: instance)
        visit edit_instance_user_role_request_path(request)
        expect(page).to have_text(I18n.t('instance_user_role_requests.form.role_request_rejected'))

        expect(page).to have_field('user_role_request[organization]', visible: false, disabled: true)
        expect(page).to have_field('user_role_request[designation]', visible: false, disabled: true)
        expect(page).to have_field('user_role_request[reason]', visible: false, disabled: true)

        expect(page).not_to have_button(I18n.t('instance_user_role_requests.form.edit_button'))
      end
    end

    context 'As an instance admin', js: true do
      let(:user) { create(:instance_administrator).user }
      let!(:requests) { create_list(:role_request, 2, instance: instance) }

      scenario 'I can approve requests' do
        visit instance_user_role_requests_path

        sample_request = requests.sample

        within find("tr.pending_role_request_#{sample_request.id}") do
          find("button.role-request-approve-#{sample_request.id}").click
        end
        expect_toastify("Approved role request of #{sample_request.user.name}!")

        expect(sample_request.user.instance_users.first.reload.role).to eq(sample_request.role)
      end

      scenario 'I can reject a request' do
        visit instance_user_role_requests_path

        sample_request = requests.sample
        within find("tr.pending_role_request_#{sample_request.id}") do
          find("button.role-request-reject-#{sample_request.id}").click
        end
        accept_confirm_dialog

        expect_toastify("Role request for #{sample_request.user.name} was rejected.")
        sample_request.reload

        expect(sample_request.workflow_state).to eq('rejected')
        expect(current_path).to eq(instance_user_role_requests_path)
        expect(page).to_not have_selector("tr.pending_role_request_#{sample_request.id}")
        expect(page).to have_selector("tr.rejected_role_request_#{sample_request.id}")
      end
    end
  end
end
