# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Components', js: true do
  let!(:instance) { create(:instance) }

  around do |example|
    RSpec::Mocks.with_temporary_scope do
      allow(Instance).to receive(:find_tenant_by_host_or_default).and_return(instance)
      allow(instance).to receive(:host).and_return(Instance.default.host)
      example.run
    end
  end

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:components) { course.disableable_components }
    let(:enabled_components) { course.reload.enabled_components }
    before do
      login_as(user, scope: :user)
      course.set_component_enabled_boolean!(components.first.key, true)
      course.set_component_enabled_boolean!(components.second.key, false)
    end

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can view the list of enabled/disabled components' do
        visit course_admin_components_path(course)

        components.each do |component|
          expect(page).to have_selector('label', text: component.display_name)
          within find('label', text: component.display_name) do
            if enabled_components.include?(component)
              expect(page).to have_field(type: 'checkbox', checked: true, visible: false)
            else
              expect(page).to have_field(type: 'checkbox', checked: false, visible: false)
            end
          end
        end
      end

      scenario 'I can disable and enable a component' do
        visit course_admin_components_path(course)

        sample_component = components.intersection(enabled_components).sample
        control = find('label', text: sample_component.display_name)
        control.click
        expect_toastify('Your changes have been saved. Refresh to see the new changes.', dismiss: true)

        expect(control).to have_field(type: 'checkbox', checked: false, visible: false)

        control.click
        expect_toastify('Your changes have been saved. Refresh to see the new changes.', dismiss: true)

        expect(control).to have_field(type: 'checkbox', checked: true, visible: false)
      end
    end
  end
end
