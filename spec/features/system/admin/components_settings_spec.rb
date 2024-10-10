# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Components', type: :feature, js: true do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let(:components) { instance.disableable_components }

    before do
      login_as(admin, scope: :user)
    end

    scenario 'Admin visits the page' do
      visit admin_instance_components_path
      settings = Instance::Settings::Components.new(instance)
      enabled_components = settings.enabled_component_ids

      components.each do |component|
        expect(page).to have_selector('tr', text: component.display_name)

        within find("tr#component_#{component.key}") do
          if enabled_components.include?(component.key.to_s)
            expect(page).to have_field(type: 'checkbox', checked: true, visible: false)
          else
            expect(page).to have_field(type: 'checkbox', checked: false, visible: false)
          end
        end
      end
    end

    scenario 'Enable/disable a component' do
      visit admin_instance_components_path
      settings = Instance::Settings::Components.new(instance)
      enabled_components = settings.enabled_component_ids
      component_to_modify = enabled_components.sample
      element_to_modify = find("tr#component_#{component_to_modify}")

      element_to_modify.find('input', visible: false).click
      expect_toastify('Instance component setting was updated successfully.')
      expect(element_to_modify).to have_field(type: 'checkbox', checked: false, visible: false)

      element_to_modify.find('input', visible: false).click
      expect_toastify('Instance component setting was updated successfully.')
      expect(element_to_modify).to have_field(type: 'checkbox', checked: true, visible: false)
    end
  end
end
