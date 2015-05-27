require 'rails_helper'

RSpec.describe 'Course: Settings', type: :feature do
  subject { page }

  let!(:user) { create(:user, role: :administrator) }
  before { login_as(user, scope: :user) }

  describe 'index' do
    let(:instance) { create(:instance) }

    with_tenant(:instance) do
      let!(:course) { create(:course) }
      before { visit course_settings_path(course) }

      context 'with valid information' do
        let(:new_title) { 'New Title' }
        let(:new_description) { 'New Description' }

        before do
          fill_in 'course_title',          with: new_title
          fill_in 'course_description',    with: new_description
          click_button I18n.t('helpers.submit.course.update')
        end

        it 'changes the attributes' do
          expect(course.reload.title).to eq(new_title)
          expect(course.reload.description).to eq(new_description)
        end
      end

      context 'with empty title' do
        before do
          fill_in 'course_title', with: ''
          click_button I18n.t('helpers.submit.course.update')
        end

        it 'does not change title' do
          expect(course.reload.title).not_to eq('')
        end

        it 'shows the error' do
          expect(page).to have_css('div.has-error')
        end
      end
    end
  end
end
