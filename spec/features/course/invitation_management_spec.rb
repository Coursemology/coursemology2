# frozen_string_literal: true
require 'rails_helper'
require 'csv'

RSpec.feature 'Courses: Invitations', js: true do
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

        click_link I18n.t('course.user_invitations.new.tabs.individual')
        click_link I18n.t('course.user_invitations.new.individual.add_user')
        name = 'My name'
        email = 'email_test@example.org'
        within find('div#individual form') do
          fill_in find(:css, 'input.course_user_name')[:name], with: name
          fill_in find(:css, 'input.course_user_email')[:name], with: email
          click_button 'submit'
        end

        expect(page).to have_selector('div.progress > div[aria-valuenow="0"]')
        expect(page).to have_selector('tr.course_user th', text: name)
        expect(page).to have_selector('tr.course_user td', text: email)
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

      scenario 'I can enable and disable registration-code registrations' do
        course = create(:course)
        expect(course.registration_key).to be_nil
        visit invite_course_users_path(course)

        # Enable registration codes
        click_link I18n.t('course.user_invitations.new.tabs.registration_code')
        within find('#registration-code') do
          click_button I18n.t('course.user_invitations.new.registration_code.enable')
        end
        expect(current_path).to eq(invite_course_users_path(course))
        click_link I18n.t('course.user_invitations.new.tabs.registration_code')
        course.reload
        expect(course.registration_key).not_to be_nil
        expect(page).to have_selector('pre', text: course.registration_key)

        # Disable registration codes
        within find('#registration-code').find(:xpath, '..') do
          click_button I18n.t('course.user_invitations.new.registration_code.disable')
        end
        expect(current_path).to eq(invite_course_users_path(course))
        click_link I18n.t('course.user_invitations.new.tabs.registration_code')
        expect(page).not_to have_selector('pre', text: course.registration_key)
        course.reload
        expect(course.registration_key).to be_nil
      end

      scenario 'I can track the status of invites' do
        course = create(:course)
        visit course_users_invitations_path(course)

        invitations = create_list(:course_user_invitation, 3, course: course)
        invitations.first.course_user.accept!(create(:instance_user).user)
        invitations.first.course_user.save!
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
      let(:course) { create(:course, :opened) }
      let(:instance_user) { create(:instance_user) }
      let(:user) { instance_user.user }

      context 'when I have an invitation code' do
        let(:invitation) { create(:course_user_invitation, course: course) }

        scenario 'I can accept invitations' do
          visit course_path(course)
          fill_in 'registration_code', with: invitation.invitation_key
          click_button I18n.t('course.user_registrations.registration.register')

          expect(page).not_to have_selector('div.register')
        end
      end

      context 'when I have a course registration code' do
        before do
          course.generate_registration_key
          course.save!
        end

        scenario 'I can register for courses using the course registration code' do
          visit course_path(course)
          fill_in 'registration_code', with: course.registration_key
          click_button I18n.t('course.user_registrations.registration.register')

          expect(page).not_to have_selector('div.register')
        end
      end
    end
  end
end
