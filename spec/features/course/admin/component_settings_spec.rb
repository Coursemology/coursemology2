# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Components', js: true do
  let!(:instance) do
    create(:instance)
  end

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:components) { course.disableable_components }
    let(:sample_component) { components.sample }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can view the list of enabled/disabled components' do
        visit course_admin_components_path(course)

        enabled_components = course.enabled_components
        components.each do |component|
          expect(page).to have_selector('label', text: component.display_name)
          option = find('label', text: component.display_name).find('input', visible: false)
          expect(option.checked?).to be(enabled_components.include?(component))
        end
      end

      scenario 'I can disable and enable a component' do
        visit course_admin_components_path(course)

        control = find('label', text: sample_component.display_name)
        control.click
        expect_toastify('Your changes have been saved. Refresh to see the new changes.')

        option = control.find('input', visible: false)
        expect(option).not_to be_checked

        control.click
        expect_toastify('Your changes have been saved. Refresh to see the new changes.')

        expect(option).to be_checked
      end
    end
  end
end
