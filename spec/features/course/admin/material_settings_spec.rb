# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Materials' do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can change the materials title' do
        visit course_admin_materials_path(course)

        new_title = 'New Title'
        empty_title = ''

        title_field = 'settings_materials_component_title'
        fill_in title_field, with: new_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.material_settings.update.success'))
        expect(page).to have_field(title_field, with: new_title)
        expect(page).to have_selector('li a', text: new_title)

        fill_in title_field, with: empty_title
        click_button 'update'
        expect(page).
          to have_selector('div', text: I18n.t('course.admin.material_settings.update.success'))
        expect(page).to have_selector('li a', text: I18n.t('course.material.sidebar_title'))
      end
    end
  end
end
