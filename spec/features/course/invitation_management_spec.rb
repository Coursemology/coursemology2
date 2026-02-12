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
        expect(page).to_not have_selector("tr.pending_invitation_#{invitation.id}")

        name = 'My name'
        email = 'email_test@example.org'
        within find('form#invite-users-individual-form') do
          find('input#name-0', visible: false).set(name)
          find('input#email-0', visible: false).set(email)
          click_button 'Invite All Users'
        end

        expect(find('h6', text: 'New Invitations (1)')).to be_present
      end

      scenario 'I can invite users by uploading a file' do
        # Build a invitation file and invite 2 random users.
        users = build_list(:user, 2)
        invitation_file = Tempfile.new(['invitation', '.csv'])
        invitation_file.
          write("Name,Email\n#{users.map { |u| [u.name, u.email].join(',') }.join("\n")}")
        invitation_file.close

        visit invite_course_users_path(course)
        click_button 'Invite from file'

        within find('#invite-users-file-upload-form') do
          find('.dropzone-input').attach_file(invitation_file.path, make_visible: true)
        end
        click_button 'Invite Users from File'
        # A dialog should open confirming invitations have been created.
        users.each do |user|
          expect(page).to have_selector('tr', text: user.name.to_s)
          expect(page).to have_selector('tr', text: user.email.to_s)
        end

        visit course_user_invitations_path(course)
        # The invitations should also be present in the invitations tab.
        users.each do |user|
          expect(page).to have_selector('tr', text: user.name.to_s)
          expect(page).to have_selector('tr', text: user.email.to_s)
        end
      end

      scenario 'I can download a template file' do
        visit invite_course_users_path(course)
        click_button 'Invite from file'
        expect(find_link(nil, download: 'template.csv')).to be_present
      end

      scenario 'I can enable and disable registration-code registrations' do
        expect(course.registration_key).to be_nil
        visit invite_course_users_path(course)

        # Enable registration codes
        click_button 'Registration Code'
        page.find('button.toggle-registration-code').click

        expect(page).to have_current_path(invite_course_users_path(course))
        expect_toastify('Successfully enabled registration code!')
        course.reload
        expect(course.registration_key).not_to be_nil
        expect(page).to have_selector('pre', text: course.registration_key)

        # Disable registration codes
        page.find('button.toggle-registration-code').click
        expect(page).to have_current_path(invite_course_users_path(course))
        expect(page).not_to have_selector('pre', text: course.registration_key)
        course.reload
        expect(course.registration_key).to be_nil
      end

      scenario 'I can track the status of invites, resend invites and delete invites' do
        visit course_user_invitations_path(course)

        old_time = 1.day.ago
        invitations = create_list(:course_user_invitation, 4, course: course, sent_at: old_time)
        invitations.first.confirm!(confirmer: user)
        invitation_to_delete = invitations.second
        invitation_to_resend = invitations.third
        invitations.last.update(is_retryable: false)
        visit course_user_invitations_path(course)

        invitations.each do |invitation|
          status_text = if invitation.confirmed?
                          'Accepted'
                        elsif invitation.is_retryable
                          'Pending'
                        else
                          'Failed'
                        end

          # query for a single row containing both correct email and correct status
          expect(page).to have_xpath(
            "//tr[contains(., '#{invitation.email}') and contains(., '#{status_text}')]"
          )
        end

        # Resend individual user_invitation
        resend_button = find("button.invitation-resend-#{invitation_to_resend.id}")
        expect(resend_button.ancestor('tr')).to have_text(invitation_to_resend.email)
        resend_button.click
        expect_toastify("Resent email invitation to #{invitation_to_resend.email}!")
        expect(invitation_to_resend.reload.sent_at).not_to eq(old_time)

        # Resend user_invitation for entire course
        click_button('Resend Pending Invitations')
        wait_for_page
        expect(page).to have_current_path(course_user_invitations_path(course))
        expect(invitation_to_delete.reload.sent_at).not_to eq(old_time)

        # Delete individual user_invitation
        delete_button = find("button.invitation-delete-#{invitation_to_delete.id}")
        expect(delete_button.ancestor('tr')).to have_text(invitation_to_delete.email)
        delete_button.click

        accept_prompt

        expect(page).to have_current_path(course_user_invitations_path(course))
        expect(page).not_to have_css("button.invitation-delete-#{invitation_to_delete.id}")
      end
    end

    context 'As a User' do
      let(:course) { create(:course, :enrollable) }
      let(:instance_user) { create(:instance_user) }
      let(:user) { instance_user.user }

      context 'when I have an invitation code for another email address' do
        let!(:invitation) { create(:course_user_invitation, course: course) }

        scenario 'I can accept invitations' do
          visit course_path(course)
          fill_in 'registration-code', with: invitation.invitation_key
          find('#register-button').click

          wait_for_page
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
          fill_in 'registration-code', with: course.registration_key
          find('#register-button').click

          expect(page).not_to have_selector('#register-button')
        end
      end
    end
  end
end
