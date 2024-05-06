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
          checkbox = find('input', visible: false)
          if enabled_components.include?(component.key.to_s)
            expect(checkbox).to be_checked
          else
            expect(checkbox).not_to be_checked
          end
        end
      end
    end

    scenario 'Enable/disable a component' do
      visit admin_instance_components_path
      settings = Instance::Settings::Components.new(instance)
      enabled_components = settings.enabled_component_ids
      component_to_modify = enabled_components.sample

      within find("tr#component_#{component_to_modify}") do
        find('input', visible: false).click
      end
      expect_toastify('Instance component setting was updated successfully.')

      within find("tr#component_#{component_to_modify}") do
        expect(find('input', visible: false)).not_to be_checked
        find('input', visible: false).click
      end

      expect_toastify('Instance component setting was updated successfully.')

      within find("tr#component_#{component_to_modify}") do
        expect(find('input', visible: false)).to be_checked
      end
    end
  end
end
