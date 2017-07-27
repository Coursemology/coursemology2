# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Instance::UserRoleRequests' do
  subject { page }
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:instance_user).user }
    before { login_as(user, scope: :user) }

    context 'As a normal instance user' do
      scenario 'I can create a new role request' do
        visit courses_path
        click_link I18n.t('course.courses.index.new_role_request')

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

      scenario 'I can edit my existing role request' do
        request = create(:role_request, user: user, instance: instance)
        visit courses_path

        click_link I18n.t('course.courses.index.edit_role_request')
        new_reason = 'New Reason'
        fill_in 'user_role_request[reason]', with: new_reason
        click_button 'edit'

        expect(request.reload.reason).to eq(new_reason)
      end
    end

    context 'As an instance admin' do
      let(:user) { create(:instance_administrator).user }
      let!(:requests) { create_list(:role_request, 2, instance: instance) }

      scenario 'I can approve requests', js: true do
        visit instance_user_role_requests_path

        sample_request = requests.sample

        within find(content_tag_selector(sample_request)) do
          click_button 'update'
        end
        wait_for_ajax
        expect(page).to have_selector('div.alert', text: I18n.t('instance_user_role_requests.approve.success'))

        expect(sample_request.user.instance_users.first.reload.role).to eq(sample_request.role)
      end

      scenario 'I can delete requests' do
        visit instance_user_role_requests_path

        sample_request = requests.sample
        find_link(nil, href: instance_user_role_request_path(sample_request)).click

        expect(page).to have_selector('div.alert', text: I18n.t('instance_user_role_requests.destroy.success'))
      end
    end
  end
end
