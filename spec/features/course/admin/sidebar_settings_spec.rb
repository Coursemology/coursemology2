# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Sidebar' do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      let(:first_weight_field) { 'settings_sidebar_sidebar_items_attributes_0_weight' }
      let(:valid_weight) { 1 }
      let(:invalid_weight) { -1 }
      scenario 'I can change the weight of a sidebar item' do
        visit course_admin_sidebar_path(course)

        fill_in first_weight_field, with: invalid_weight
        click_button I18n.t('course.admin.sidebar_settings.edit.button')
        expect(page).to have_selector('div.has-error')

        fill_in first_weight_field, with: valid_weight
        click_button I18n.t('course.admin.sidebar_settings.edit.button')
        expect(page).to have_field(first_weight_field, with: valid_weight)
      end
    end
  end
end
