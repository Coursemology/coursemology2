require 'rails_helper'

RSpec.feature 'Course: Administration: Administration' do
  subject { page }

  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As an Course Manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      scenario 'I can change the course attributes' do
        visit course_admin_path(course)

        fill_in 'course_title', with: ''
        click_button I18n.t('helpers.submit.course.update')
        expect(course.reload.title).not_to eq('')
        expect(page).to have_selector('div.has-error')

        new_title = 'New Title'
        new_description = 'New Description'
        fill_in 'course_title',          with: new_title
        fill_in 'course_description',    with: new_description
        click_button I18n.t('helpers.submit.course.update')

        expect(page).to have_selector('div.alert.alert-success')
        expect(course.reload.title).to eq(new_title)
        expect(course.reload.description).to eq(new_description)
      end
    end
  end
end
