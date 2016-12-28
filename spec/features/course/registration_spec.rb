# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: Registration' do
  let!(:instance) { Instance.default }

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

    context 'when the user has requested to register for a course' do
      let!(:enrol_request) { create(:course_enrol_request, course: course, user: user) }

      scenario 'user can cancel his registration request' do
        visit course_path(course)
        expect(page).not_to have_button(I18n.t('course.user_registrations.registration.register'))

        click_link I18n.t('course.user_registrations.registration.deregister')
        expect(current_path).to eq(course_path(course))
        expect(page).to have_button(I18n.t('course.user_registrations.registration.register'))
      end
    end

    context 'when the user has been enrolled' do
      let!(:enrolled_student) { create(:course_student, course: course, user: user) }

      scenario 'user cannot de-register or re-register for the course' do
        visit course_path(course)
        expect(page).not_to have_button(I18n.t('course.user_registrations.registration.register'))
        expect(page).not_to have_link(I18n.t('course.user_registrations.registration.deregister'))
      end
    end
  end
end
