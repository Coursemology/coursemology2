# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Instances' do
  let(:instance) { Instance.default }
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
        end.not_to(change { Instance.count })

        fill_in 'instance_name', with: 'Lorem ipsum'
        fill_in 'instance_host', with: generate(:host)
        expect do
          click_button I18n.t('helpers.submit.instance.create')
        end.to change { Instance.count }.by(1)

        expect(current_path).to eq(admin_instances_path)
        expect(page).to have_selector('div.alert.alert-success')
      end

      scenario 'I can edit instances' do
        instance = create(:instance)
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
        instances &= Instance.order_by_name
        expect(instances).not_to be_empty

        instances.each do |instance|
          # Get the page number each instance is on.
          page_number = Instance.order_for_display.map(&:id).index(instance.id) /
                        Instance.page.default_per_page + 1
          visit admin_instances_path(page: page_number)
          expect(page).to have_content_tag_for(instance)
          expect(page).
            to have_link(nil, href: admin_instance_admin_url(host: instance.host, port: nil))
        end
      end

      scenario 'I can destroy an instance' do
        instance = create(:instance)
        page_number = Instance.order_for_display.map(&:id).index(instance.id) /
                      Instance.page.default_per_page + 1
        visit admin_instances_path(page: page_number)

        within find(content_tag_selector(instance)) do
          expect { find(:css, 'a.delete').click }.to \
            change { Instance.find_by(id: instance.id) }.to(nil)
        end
      end
    end
  end
end
