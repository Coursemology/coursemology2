# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Components' do
  let!(:instance) do
    create(:instance, :with_video_component_enabled, :with_virtual_classroom_component_enabled)
  end

  with_tenant(:instance) do
    let(:course) do
      create(:course, :with_video_component_enabled, :with_virtual_classroom_component_enabled)
    end
    let(:components) { Course::ControllerComponentHost.components.select(&:can_be_disabled?) }
    let(:sample_component_id) do
      "settings_effective_enabled_component_ids_#{components.sample.key}"
    end
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can view the list of enabled/disabled components' do
        visit course_admin_components_path(course)

        components.each do |component|
          expect(page).to have_selector('th', text: component.display_name)
          enabled = course.reload.settings(:components, component.key).enabled
          enabled = enabled.nil? ? component.enabled_by_default? : enabled
          checkbox = find("#settings_effective_enabled_component_ids_#{component.key}")
          if enabled
            expect(checkbox).to be_checked
          else
            expect(checkbox).not_to be_checked
          end
        end
      end

      scenario 'I can enable a component' do
        visit course_admin_components_path(course)

        check(sample_component_id)
        click_button I18n.t('course.admin.component_settings.edit.button')
        expect(page).to have_checked_field(sample_component_id)
      end

      scenario 'I can disable a component' do
        visit course_admin_components_path(course)

        uncheck(sample_component_id)
        click_button I18n.t('course.admin.component_settings.edit.button')
        expect(page).to have_unchecked_field(sample_component_id)
      end
    end
  end
end
