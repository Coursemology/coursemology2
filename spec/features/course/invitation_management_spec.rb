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
        # Build a invitation file and invite 2 random users.
        users = build_list(:user, 2)
        invitation_file = Tempfile.new('invitation')
        invitation_file.
          write("Name,Email\n" + users.map { |u| [u.name, u.email].join(',') }.join("\n"))
        invitation_file.close

        visit invite_course_users_path(course)
        within find('#course_invitations_file').find(:xpath, '../..') do
          attach_file 'course_invitations_file', invitation_file.path
          click_button 'submit'
        end
        expect(page).to have_selector('div.progress')
        users.each do |user|
          expect(page).to have_selector('tr.course_user th', text: user.name)
          expect(page).to have_selector('tr.course_user td', text: user.email)
          expect(page).to have_selector('tr.course_user td',
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

      scenario 'I can track the status of invites and delete invites' do
        visit course_users_invitations_path(course)

        invitations = create_list(:course_user_invitation, 3, course: course)
        invitations.first.course_user.accept!(create(:instance_user).user)
        invitations.first.course_user.save!
        invitation_to_delete = invitations.second
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

        find_link(nil,
                  href: course_user_path(course, invitation_to_delete.course_user)).click
        expect(current_path).to eq(course_users_invitations_path(course))
        expect(page).not_to have_content_tag_for(invitation_to_delete.course_user)
      end
    end

    context 'As a User' do
      let(:course) { create(:course, :opened) }
      let(:instance_user) { create(:instance_user) }
      let(:user) { instance_user.user }

      context 'when I have been invited using my current email address' do
        let(:user_email) { user.emails.first }
        let!(:invitation) do
          create(:course_user_invitation, course: course, user_email: user_email)
        end

        scenario 'I can enter the course' do
          visit course_path(course)
          expect(page).not_to have_button('.register')

          click_button I18n.t('course.user_registrations.registration.enter_course')
          expect(invitation.course_user.reload).to be_approved
        end
      end

      context 'when I have an invitation code for another email address' do
        let(:invitation) { create(:course_user_invitation, course: course) }

        scenario 'I can accept invitations' do
          visit course_path(course)
          fill_in 'registration_code', with: invitation.invitation_key
          click_button I18n.t('course.user_registrations.registration.register')

          expect(page).not_to have_selector('div.register')
          expect(user.reload.emails).to include(invitation.user_email)
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
