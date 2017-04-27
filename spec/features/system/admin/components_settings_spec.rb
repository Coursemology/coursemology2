# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'System: Administration: Components', type: :feature do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let(:components) { Course::ControllerComponentHost.disableable_components }
    let(:sample_component_id) do
      "settings_effective_enabled_component_ids_#{components.sample.key}"
    end

    before { login_as(admin, scope: :user) }

    scenario 'Admin visits the page' do
      visit admin_instance_components_path

      settings = Instance::Settings::Effective.new(instance.reload.settings,
                                                   Course::ControllerComponentHost)
      enabled_components = settings.enabled_component_ids
      components.each do |component|
        expect(page).to have_selector('th', text: component.display_name)

        checkbox = find("#settings_effective_enabled_component_ids_#{component.key}")
        if enabled_components.include?(component.key.to_s)
          expect(checkbox).to be_checked
        else
          expect(checkbox).not_to be_checked
        end
      end
    end

    scenario 'Enable a component' do
      visit admin_instance_components_path

      check(sample_component_id)
      click_button 'submit'
      expect(page).to have_checked_field(sample_component_id)
    end

    scenario 'Disable a component' do
      visit admin_instance_components_path

      uncheck(sample_component_id)
      click_button 'submit'
      expect(page).to have_unchecked_field(sample_component_id)
    end
  end
end
