require 'rails_helper'
require 'csv'

RSpec.feature 'Courses: Invitations' do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    before { login_as(user, scope: :user) }

    context 'As a Course manager' do
      let(:user) { create(:administrator) }

      scenario 'I can invite users by individually entering their addresses' do
        course = create(:course)
        invitation = create(:course_user_invitation, course: course)
        visit invite_course_users_path(course)

        # Make sure existing invitations don't show up.
        expect(page).not_to have_selector(".user_invitation#user_invitation_#{invitation.id}")

        pending 'JavaScript support'
        name = 'My name'
        email = 'email_test@example.org'
        fill_in 'course_user_name', with: name
        fill_in 'course_user_email', with: email
        click_button 'submit'

        expect(page).to have_selector('div.progress', text: '0%')
        expect(page).to have_selector('.course_user_invitation th', text: name)
        expect(page).to have_selector('.course_user_invitation td', text: name)
      end

      scenario 'I can invite users by uploading a file' do
        course = create(:course)
        invitation_file = File.join(__dir__, '../../fixtures/course/invitation.csv')
        invitations = CSV.read(invitation_file, headers: true)

        visit invite_course_users_path(course)
        within find('#course_invitations_file').find(:xpath, '../..') do
          attach_file 'course_invitations_file', invitation_file
          click_button 'submit'
        end

        expect(page).to have_selector('div.progress')
        invitations.each do |invitation|
          expect(page).to have_selector('tr.course_user th', text: invitation[0])
          expect(page).to have_selector('tr.course_user td', text: invitation[1])
          expect(page).to have_selector('tr.course_user td',
                                        text: I18n.t('course.users.status.invited'))
        end
      end

      scenario 'I can track the status of invites' do
        course = create(:course)
        visit course_users_invitations_path(course)

        invitations = create_list(:course_user_invitation, 3, course: course)
        invitations.first.course_user.accept!(create(:instance_user).user)
        visit course_users_invitations_path(course)

        expect(page).to have_selector('div.progress')
        invitations.each do |invitation|
          within page.find(".course_user#course_user_#{invitation.course_user.id}") do
            expect(page).to have_selector('th')
            expect(page).to have_selector('td')

            if invitation.course_user.approved?
              expect(page).to have_selector('td', text: I18n.t('course.users.status.accepted'))
            else
              expect(page).to have_selector('td', text: I18n.t('course.users.status.invited'))
            end
          end
        end
      end
    end

    context 'As a User' do
      let(:course) { create(:open_course) }
      let(:instance_user) { create(:instance_user) }
      let(:user) { instance_user.user }
      let(:course_user) { create(:course_user, course: course, user: user) }
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
