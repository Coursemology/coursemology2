# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: Registration' do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course, :opened) }
    let(:user) { create(:user) }
    before { login_as(user, scope: :user) }

    scenario 'Users can register for the course' do
      visit course_path(course)

      expect(page).to have_text(course.description)
      expect(page).to have_button(I18n.t('course.user_registrations.registration.register'))

      click_button I18n.t('course.user_registrations.registration.register')
      expect(current_path).to eq(course_path(course))

      expect(page).not_to have_button('.register')
    end

    context 'when the user is registered in the course' do
      let!(:course_student) { create(:course_student, :approved, course: course, user: user) }
      scenario 'Users cannot re-register for a course' do
        visit course_path(course)

        expect(page).not_to have_button('course.user_registrations.registration.register')
      end
    end
  end
end
