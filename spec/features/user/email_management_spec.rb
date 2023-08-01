# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'User: Emails', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:student) { create(:user) }
    let(:user) { create(:user) }
    let!(:confirmed_emails) { create_list(:user_email, 2, user: user, primary: false) }
    let!(:unconfirmed_email) { create(:user_email, :unconfirmed, user: user, primary: false) }

    before do
      login_as(user, scope: :user)
      visit edit_user_profile_path
    end

    scenario 'I can view all my emails' do
      user.reload.emails.each do |email|
        expect(page).to have_selector('section', text: email.email)
        section = find('section', text: email.email)

        unless email.confirmed?
          expect(section).to have_text('Unconfirmed')
          expect(section).to have_content('Resend confirmation email')
        end

        expect(section).to have_text('Primary') if email.primary?
        expect(section).to have_content('Set as primary') if !email.primary? && email.confirmed?
      end
    end

    scenario 'I can add new emails' do
      invalid_email = 'test@@example'
      valid_email = build(:user_email).email

      expect do
        click_button 'Add email address'
        fill_in 'newEmail', with: invalid_email
        click_button 'Add email address'
        expect(page).to have_text('is invalid')
      end.not_to(change { user.emails.count })

      expect do
        fill_in 'newEmail', with: valid_email
        click_button 'Add email address'
        expect(page).to have_selector('section', text: valid_email)
      end.to change { user.emails.count }.by(1)
    end

    context 'When a secondary email with existing course invitations is added' do
      let(:course1) { create(:course) }
      let(:course2) { create(:course) }
      let(:user) { student }
      let!(:invitation1) do
        create(:course_user_invitation, name: 'course1_user', email: build(:user_email).email, course: course1)
      end
      let!(:invitation2) do
        create(:course_user_invitation, name: 'course2_user', email: invitation1.email, course: course2)
      end

      it 'enrols the user to the new courses', type: :notifier do
        expect do
          click_button 'Add email address'
          fill_in 'newEmail', with: invitation1.email
          click_button 'Add email address'
          wait_for_page
          expect(page).to have_selector('section', text: invitation1.email)
        end.to change { user.emails.count }.by(1)

        expect do
          confirm_registration_token_via_email
        end.to change(course1.users, :count).by(1).
          and change(course2.users, :count).by(1)
      end
    end

    context 'When a secondary email has been used by someone else but unconfirmed', type: :notifier do
      let(:other_user) { student }
      let!(:non_primary_email) { create(:user_email, :unconfirmed, user: other_user, primary: false) }

      let(:actual_user) { student }

      it 'expects the actual user to be able to claim the email and confirm it' do
        expect do
          click_button 'Add email address'
          fill_in 'newEmail', with: non_primary_email.email
          click_button 'Add email address'
          expect(page).to have_selector('section', text: non_primary_email.email)
        end.to change(user.emails, :count).by(1).
          and change(other_user.emails, :count).by(-1)

        confirm_registration_token_via_email
        expect(user.emails.last.reload.confirmed_at).not_to be_nil
      end
    end

    scenario 'I can delete a email' do
      non_primary_emails = user.reload.emails.filter { |email| !email.primary? }
      email_to_delete = non_primary_emails.sample
      section = find('section', text: email_to_delete.email)
      delete_button = section.find('button')

      expect do
        delete_button.click
        click_button 'Remove email' if email_to_delete.confirmed?
        expect_toastify("#{email_to_delete.email} was successfully removed.")
      end.to change { user.emails.count }.by(-1)
    end

    scenario 'I can set an email as primary' do
      email_to_be_set_as_primary = confirmed_emails.sample
      section = find('section', text: email_to_be_set_as_primary.email)
      set_as_primary_link = section.find('a', text: 'Set as primary')

      set_as_primary_link.click

      expect_toastify("#{email_to_be_set_as_primary.email} was successfully set as your primary email.")
      expect(email_to_be_set_as_primary.reload).to be_primary
    end

    scenario 'I can request a new confirmation email' do
      section = find('section', text: unconfirmed_email.email)
      resend_confirmation_link = section.find('a', text: 'Resend confirmation email')

      resend_confirmation_link.click

      expect_toastify("A confirmation email has been sent to #{unconfirmed_email.email}.")
    end
  end
end
