# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: Codaveri', js: true do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }

      scenario 'I can enable and disable codaveri ITSP setting' do
        visit course_admin_codaveri_path(course)
        expect(course.reload.codaveri_itsp_enabled?).to eq(nil)

        itsp_engine_radio_button = find('label', text: 'ITSP Engine')
        itsp_engine_radio_button.click
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.', dismiss: true)
        expect(course.reload.codaveri_itsp_enabled?).to eq(true)

        default_engine_radio_button = find('label', text: 'Default Engine')
        default_engine_radio_button.click
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.', dismiss: true)
        expect(course.reload.codaveri_itsp_enabled?).to eq(false)
      end

      scenario 'I can change automatic feedback comment setting' do
        visit course_admin_codaveri_path(course)

        find('label', text: 'Publish feedback directly to student').click
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.', dismiss: true)
        expect(course.reload.codaveri_feedback_workflow).to eq('publish')

        find('label', text: 'Generate no feedback').click
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.', dismiss: true)
        expect(course.reload.codaveri_feedback_workflow).to eq('none')
      end
    end
  end
end
