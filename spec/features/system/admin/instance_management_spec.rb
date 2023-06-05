# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Instances', js: true do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    context 'As a system administrator' do
      let!(:user) { create(:administrator) }
      before { login_as(user, scope: :user) }

      scenario 'I can create new instances' do
        visit admin_instances_path

        expect do
          find('button#new-instance-button').click
        end.not_to(change { Instance.count })

        new_name = 'Lorem Ipsum'
        new_host = generate(:host)

        fill_in 'name', with: new_name
        fill_in 'host', with: new_host

        find('button.btn-submit').click
        expect_toastify("New instance #{new_name} (#{new_host}) created!")
      end

      scenario 'I can edit instances' do
        create(:instance)
        instance = Instance.order_for_display[1] # gets first non-default instance
        visit admin_instances_path

        within find("div.instance_name_field_#{instance.id}") do
          find('button.inline-edit-button', visible: false).click
          find('input').set(' ')
          find('button.confirm-btn').click
        end

        expect(instance.reload.name).not_to eq('')
        expect(find("div.instance_name_field_#{instance.id}").
          find('p.MuiFormHelperText-root').text).to eq('Cannot be empty.')
        find('button.cancel-btn').click

        new_name = 'New Name'
        new_host = generate(:host)
        within find("div.instance_name_field_#{instance.id}") do
          find('button.inline-edit-button', visible: false).click
          find('input').set(new_name)
          find('button.confirm-btn').click
        end
        wait_for_page
        expect(find("div.instance_name_field_#{instance.id}").text).to eq(new_name)
        expect(instance.reload.name).to eq(new_name)

        within find("div.instance_host_field_#{instance.id}") do
          find('button.inline-edit-button', visible: false).click
          find('input').set(new_host)
          find('button.confirm-btn').click
        end
        wait_for_page
        expect(find("div.instance_host_field_#{instance.id}").text).to eq(new_host)
        expect(instance.reload.host).to eq(new_host)
      end

      scenario 'I can see all instances' do
        create_list(:instance, 2)
        instances = Instance.order_by_name.first(2) # gets first 2 instances on display
        expect(instances).not_to be_empty
        visit admin_instances_path

        instances.each do |instance|
          expect(page).to have_selector("div.instance_name_field_#{instance.id}", exact_text: instance.name)
          expect(page).to have_link(nil, href: "//#{instance.host}/admin/instances")
        end
      end

      scenario 'I can destroy an instance' do
        create(:instance)
        instance = Instance.order_for_display[1] # the 1st instance (Default) cannot be destroyed
        visit admin_instances_path

        expect(page).to have_selector("div.instance_name_field_#{instance.id}", exact_text: instance.name)
        find("button.instance-delete-#{instance.id}").click
        click_button('Delete')

        expect(page).not_to have_selector("div.instance_name_field_#{instance.id}", exact_text: instance.name)
        expect_toastify("#{instance.name} was deleted.")
      end
    end
  end
end
