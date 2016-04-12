# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Instances' do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    context 'As a system administrator' do
      let!(:user) { create(:administrator) }
      before { login_as(user, scope: :user) }

      scenario 'I can create new instances' do
        visit new_admin_instance_path

        expect(page).to have_field('instance_name')
        expect(page).to have_field('instance_host')

        expect do
          click_button I18n.t('helpers.submit.instance.create')
        end.not_to change { Instance.count }

        fill_in 'instance_name', with: 'Lorem ipsum'
        fill_in 'instance_host', with: generate(:host)
        expect do
          click_button I18n.t('helpers.submit.instance.create')
        end.to change { Instance.count }.by(1)

        expect(current_path).to eq(admin_instances_path)
        expect(page).to have_selector('div.alert.alert-success')
      end

      scenario 'I can edit instances' do
        visit edit_admin_instance_path(instance)

        fill_in 'instance_name', with: ''
        click_button I18n.t('helpers.submit.instance.update')
        expect(instance.reload.name).not_to eq('')
        expect(page).to have_css('div.has-error')

        new_name = 'New Name'
        new_host = generate(:host)
        fill_in 'instance_name', with: new_name
        fill_in 'instance_host', with: new_host
        click_button I18n.t('helpers.submit.instance.update')

        expect(instance.reload.name).to eq(new_name)
        expect(instance.reload.host).to eq(new_host)
        expect(current_path).to eq(admin_instances_path)
        expect(page).to have_selector('div.alert.alert-success')
      end

      scenario 'I can see all instances' do
        instances = create_list(:instance, 2)
        last_page = Instance.page.total_pages
        instances &= Instance.order_by_id.page(last_page)
        expect(instances).not_to be_empty

        visit admin_instances_path(page: last_page)

        instances.each do |instance|
          expect(page).to have_content_tag_for(instance)
        end
      end

      scenario 'I can destroy an instance' do
        instance = create(:instance)
        last_page = Instance.page.total_pages
        visit admin_instances_path(page: last_page)

        within find(content_tag_selector(instance)) do
          expect { find(:css, 'a.delete').click }.to \
            change { Instance.find_by(id: instance.id) }.to(nil)
        end
      end
    end
  end
end
