require 'rails_helper'
require 'csv'

RSpec.feature 'Courses: Invitations' do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    before { login_as(user, scope: :user) }

    context 'As a Course manager' do
      let(:user) { create(:administrator) }
      scenario 'I can invite users by individually entering their addresses' do
        pending
        course = create(:course)
        visit invite_course_users_path(course)

        name = 'My name'
        email = 'email_test@example.org'
        fill_in 'course_user_name', with: name
        fill_in 'course_user_email', with: email
        click_button 'submit'

        expect(page).to have_selector('div.progress', text: '0%')
        expect(page).to have_selector('.course_user_invitation th', text: name)
        expect(page).to have_selector('.course_user_invitation td', text: name)
        pending
      end

      scenario 'I can invite users by uploading a file' do
        pending
        course = create(:course)
        invitation_file = File.join(__dir__, '../../fixtures/course/invitation.csv')
        invitations = CSV.read(invitation_file)

        visit invite_course_users_path(course)
        attach_file 'course_users_file', invitation_file
        click_button 'submit'

        expect(page).to have_selsector('div.progress', text: '0%')
        invitations.each do |invitation|
          expect(page).to have_selector('.course_user_invitation th', text: invitation[0])
          expect(page).to have_selector('.course_user_invitation td', text: invitation[1])
        end
      end

      scenario 'I can track the status of invites' do
        pending
        course = create(:course)
        invitations = create_list(:course_user_invitation, 3, course: course)
        invitations.first.course_user.approve!
        visit course_users_invitations_path(course)

        expect(page).to have_selector('div.progress', text: '33%')
        approved_text = I18n.t('course.users.statuses.approved')
        invited_text = I18n.t('course.users.statuses.invited')
        invitations.each do |invitation|
          expect(page).to have_selector('.course_user_invitation th', text: invitation[0])
          expect(page).to have_selector('.course_user_invitation td', text: invitation[1])

          status_text = invitation.course_user.approved? ? approved_text : invited_text
          expect(page).to have_selector('.course_user_invitation td', text: status_text)
        end
      end
    end

    context 'As a User' do
      let(:course) { create(:course) }
      let(:course_user) { create(:course_user, course: course) }
      let(:invitation) { create(:course_user_invitation, course_user: course_user) }
      scenario 'I can accept invitations' do
        pending
        visit course_path(course)
        fill_in 'key', with: invitation.invitation_key
        click_button 'register'

        expect(page).not_to have_selector('div.register')
      end
    end
  end
end
