# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Codaveri', js: true do
  let!(:instance) { create(:instance, :with_codaveri_component_enabled) }

  with_tenant(:instance) do
    let(:course) { create(:course, :with_codaveri_component_enabled) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can enable and disable codaveri ITSP setting' do
        visit course_admin_codaveri_path(course)
        expect(course.reload.codaveri_itsp_enabled?).to eq(nil)

        control = find('label', text: 'Enable ITSP')
        control.click
        expect_toastify('Your changes have been saved.')

        option = control.find('input', visible: false)
        expect(option).to be_checked
        expect(course.reload.codaveri_itsp_enabled?).to eq(true)

        control.click
        expect_toastify('Your changes have been saved.')

        expect(option).not_to be_checked
        expect(course.reload.codaveri_itsp_enabled?).to eq(false)
      end
    end
  end
end
