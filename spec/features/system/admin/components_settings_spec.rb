# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Components', type: :feature, js: true do
  let!(:instance) { create(:instance) }

  # Allow requests to behave as if the isolated instance is mapped to localhost.
  around do |example|
    RSpec::Mocks.with_temporary_scope do
      allow(Instance).to receive(:find_tenant_by_host_or_default).and_return(instance)
      allow(instance).to receive(:host).and_return(Instance.default.host)
      example.run
    end
  end

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let(:components) { instance.disableable_components }
    let(:enabled_components) { instance.reload.enabled_components }
    before do
      instance.set_component_enabled_boolean!(components.first.key, true)
      instance.set_component_enabled_boolean!(components.second.key, false)
      login_as(admin, scope: :user, redirect_url: admin_instance_components_path)
    end

    scenario 'Admin visits the page' do
      settings = Instance::Settings::Components.new(instance)

      components.each do |component|
        expect(page).to have_selector("tr#component_#{component.key}")

        within find("tr#component_#{component.key}") do
          if enabled_components.include?(component)
            expect(page).to have_field(type: 'checkbox', checked: true, visible: false)
          else
            expect(page).to have_field(type: 'checkbox', checked: false, visible: false)
          end
        end
      end
    end

    scenario 'Enable/disable a component' do
      settings = Instance::Settings::Components.new(instance)

      sample_component = components.intersection(enabled_components).sample
      element_to_modify = find("tr#component_#{sample_component.key}")

      element_to_modify.find('input', visible: false).click
      expect_toastify('Instance component setting was updated successfully.', dismiss: true)
      expect(element_to_modify).to have_field(type: 'checkbox', checked: false, visible: false)

      element_to_modify.find('input', visible: false).click
      expect_toastify('Instance component setting was updated successfully.', dismiss: true)
      expect(element_to_modify).to have_field(type: 'checkbox', checked: true, visible: false)
    end
  end
end
