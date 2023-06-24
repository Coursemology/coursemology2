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

      scenario 'Users can register course using invitation code', js: true do
        visit course_path(course)

        # No code input
        find('#register-button').click
        expect(page).
          to have_selector('div.Toastify__toast-body', text: 'Please enter an invitation code')

        # Enter wrong registration code
        fill_in 'registration-code', with: 'defintielyTheWrongCode'
        find('#register-button').click
        expect(page).
          to have_selector('div.Toastify__toast-body', text: 'Your code is incorrect')

        # Correct code
        fill_in 'registration-code', with: invitation.invitation_key
        find('#register-button').click
      end
    end

    context 'when the course allows enrol requests' do
      let(:course) { create(:course, :enrollable) }

      scenario 'Users can create and cancel enrol requests', js: true do
        visit course_path(course)

        expect(page).to have_text(course.description)

        expect(ActionMailer::Base.deliveries.count).to eq(0)
        find('#submit-enrol-request-button').click
        expect(page).to have_selector('div.Toastify__toast-body', text: 'Your enrol request has been submitted.')
        expect(ActionMailer::Base.deliveries.count).not_to eq(0)

        # Cancel request
        find('#cancel-enrol-request-button').click
        expect(page).to have_selector('div.Toastify__toast-body', text: 'Your enrol request has been cancelled.')
      end

      context 'when the user has been enrolled' do
        let!(:enrolled_student) { create(:course_student, course: course, user: user) }

        scenario 'user cannot de-register or re-register for the course', js: true do
          visit course_path(course)
          expect(page).not_to have_selector('#submit-enrol-request-button')
          expect(page).not_to have_selector('#cancel-enrol-request-button')
        end
      end
    end
  end
end
