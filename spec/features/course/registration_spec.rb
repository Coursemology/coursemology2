# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Courses: Registration' do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:user) { create(:user) }
    before { login_as(user, scope: :user) }

    context 'when the course has unconfirmed invitations' do
      let!(:invitation) { create(:course_user_invitation, course: course) }

      scenario 'Users can register course using invitation code' do
        visit course_path(course)

        # Submit with empty code
        click_button I18n.t('course.user_registrations.registration.register')
        expect(page).to have_selector('span.help-block')

        fill_in 'registration_code', with: invitation.invitation_key
        click_button I18n.t('course.user_registrations.registration.register')

        expect(page).
          to have_selector('div.alert', text: I18n.t('course.user_registrations.create.registered'))
      end
    end

    context 'when the course allows enrol requests' do
      let(:course) { create(:course, :enrollable) }

      scenario 'Users can create and cancel enrol requests' do
        visit course_path(course)

        expect(page).to have_text(course.description)

        expect(ActionMailer::Base.deliveries.count).to eq(0)
        click_link I18n.t('course.user_registrations.registration.new_enrol_request_button')
        expect(page).
          to have_selector('div.alert', text: I18n.t('course.enrol_requests.create.success'))
        expect(ActionMailer::Base.deliveries.count).not_to eq(0)

        # Cancel request
        click_link I18n.t('course.user_registrations.registration.deregister')
        expect(page).
          to have_selector('div.alert', text: I18n.t('course.enrol_requests.destroy.success'))
      end

      context 'when the user has been enrolled' do
        let!(:enrolled_student) { create(:course_student, course: course, user: user) }

        scenario 'user cannot de-register or re-register for the course' do
          visit course_path(course)

          new_request = I18n.t('course.user_registrations.registration.new_enrol_request_button')
          expect(page).not_to have_link(new_request)

          delete_request = I18n.t('course.user_registrations.registration.deregister')
          expect(page).not_to have_link(delete_request)
        end
      end
    end
  end
end
