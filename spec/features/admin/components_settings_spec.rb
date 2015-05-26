require 'rails_helper'

RSpec.feature 'Administration: Components', type: :feature do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let(:components)  { Course::ComponentHost.components }
    let(:sample_component_id) { "instance_settings_enabled_component_ids_#{components.sample.key}" }

    before { login_as(admin, scope: :user) }

    scenario 'Admin visits the page' do
      visit admin_components_path

      components.each do |component|
        expect(page).to have_selector('th', text: component.name)
        enabled = instance.reload.settings(:components, component.key).enabled
        checkbox = find("#instance_settings_enabled_component_ids_#{component.key}")
        if enabled
          expect(checkbox).to be_checked
        else
          expect(checkbox).not_to be_checked
        end
      end
    end

    scenario 'Enable a component' do
      visit admin_components_path

      page.check(sample_component_id)
      click_button('submit')
      expect(page).to have_checked_field(sample_component_id)
    end

    scenario 'Disable a component' do
      visit admin_components_path

      page.uncheck(sample_component_id)
      click_button('submit')
      expect(page).to have_unchecked_field(sample_component_id)
    end
  end
end
