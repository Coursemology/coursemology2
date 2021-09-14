# frozen_string_literal: true
require 'rails_helper'
require 'csv'

RSpec.feature 'Courses: Invitations', js: true do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    before { login_as(user, scope: :user) }

    context 'As a Course manager' do
      let(:user) { create(:user) }
      let(:course) { create(:course, creator: user) }

      scenario 'I can invite users by individually entering their addresses' do
        invitation = create(:course_user_invitation, course: course)
        visit invite_course_users_path(course)

        # Make sure existing invitations don't show up.
        expect(page).not_to have_selector(".user_invitation#user_invitation_#{invitation.id}")

        click_link I18n.t('course.user_invitations.new.tabs.individual')
        name = 'My name'
        email = 'email_test@example.org'
        within find('div#individual form') do
          find(:css, 'input.invitation_name').set(name)
          find(:css, 'input.invitation_email').set(email)
          click_button 'submit'
        end

        expect(page).to have_selector('div.progress > div[aria-valuenow="0"]')
        expect(page).to have_selector('tr.user_invitation th', text: name)
        expect(page).to have_selector('tr.user_invitation td', text: email)
      end

      scenario 'I can invite users by uploading a file' do
        # Build a invitation file and invite 2 random users.
        users = build_list(:user, 2)
        invitation_file = Tempfile.new('invitation')
        invitation_file.
          write("Name,Email\n#{users.map { |u| [u.name, u.email].join(',') }.join("\n")}")
        invitation_file.close

        visit invite_course_users_path(course)
        within find('#course_invitations_file').find(:xpath, '../..') do
          attach_file 'course_invitations_file', invitation_file.path
          click_button 'submit'
        end
        expect(page).to have_selector('div.progress')
        users.each do |user|
          expect(page).to have_selector('tr.user_invitation th', text: user.name)
          expect(page).to have_selector('tr.user_invitation td', text: user.email)
          expect(page).to have_selector('tr.user_invitation td',
                                        text: I18n.t('course.users.status.invited'))
        end
      end

      scenario 'I can enable and disable registration-code registrations' do
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

      scenario 'I can track the status of invites, resend invites and delete invites', js: true do
        visit course_user_invitations_path(course)

        old_time = 1.day.ago
        invitations = create_list(:course_user_invitation, 3, course: course, sent_at: old_time)
        invitations.first.confirm!(confirmer: user)
        invitation_to_delete = invitations.second
        invitation_to_resend = invitations.last
        visit course_user_invitations_path(course)

        expect(page).to have_selector('div.progress')
        invitations.each do |invitation|
          within find(content_tag_selector(invitation)) do
            expect(page).to have_selector('th')
            expect(page).to have_selector('td')

            if invitation.confirmed?
              expect(page).to have_selector('td', text: I18n.t('course.users.status.accepted'))
            else
              expect(page).to have_selector('td', text: I18n.t('course.users.status.invited'))
            end
          end
        end

        # Resend individual user_invitation
        within find(content_tag_selector(invitation_to_resend)) do
          find_link(
            nil,
            href: course_user_invitation_resend_invitation_path(course, invitation_to_resend)
          ).click
        end
        wait_for_ajax
        expect(page).to have_css('.alert.alert-success')

        # Resend user_invitation for entire course
        find_link(I18n.t('course.user_invitations.index.resend_button'),
                  href: resend_invitations_course_users_path(course)).click
        expect(current_path).to eq(course_user_invitations_path(course))
        expect(invitation_to_delete.reload.sent_at).not_to eq(old_time)

        find_link(nil,
                  href: course_user_invitation_path(course, invitation_to_delete)).click
        expect(page).to have_selector('.confirm-btn')
        accept_confirm_dialog

        expect(page).to have_selector('div.alert-success',
                                      text: I18n.t('course.user_invitations.destroy.success'))
        expect(current_path).to eq(course_user_invitations_path(course))
        expect(page).to have_no_content_tag_for(invitation_to_delete)
      end
    end

    context 'As a User' do
      let(:course) { create(:course, :enrollable) }
      let(:instance_user) { create(:instance_user) }
      let(:user) { instance_user.user }

      context 'when I have been invited using my current email address' do
        let(:user_email) { user.email }
        let!(:invitation) do
          create(:course_user_invitation, course: course, email: user_email)
        end

        scenario 'I can enter the course' do
          visit course_path(course)
          expect(page).not_to have_button('.register')

          click_button I18n.t('course.user_registrations.registration.enter_course')

          course_user = course.course_users.find_by(user_id: user.id)
          expect(course_user).to be_present
          expect(course_user.name).to eq(invitation.name)
        end
      end

      context 'when I have an invitation code for another email address' do
        let!(:invitation) { create(:course_user_invitation, course: course) }

        scenario 'I can accept invitations' do
          visit course_path(course)
          fill_in 'registration_code', with: invitation.invitation_key
          click_button I18n.t('course.user_registrations.registration.register')

          expect(page).not_to have_selector('div.register')
          course_user = course.course_users.find_by(user_id: user.id)
          expect(course_user).to be_present
          expect(course_user.name).to eq(invitation.name)
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
