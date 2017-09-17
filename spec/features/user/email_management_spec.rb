# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'User: Emails' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:confirmed_emails) { create_list(:user_email, 2, user: user, primary: false) }
    let!(:unconfirmed_email) { create(:user_email, :unconfirmed, user: user, primary: false) }

    before do
      login_as(user, scope: :user)
      visit user_emails_path
    end

    scenario 'I can view all my emails' do
      user.reload.emails.each do |email|
        expect(page).to have_selector('tr td', text: email.email)

        unless email.confirmed?
          expect(page).to have_selector("tr#user_email_#{email.id} td",
                                        text: I18n.t('user.emails.email.unconfirmed'))
        end

        if email.primary?
          expect(page).to have_selector("tr#user_email_#{email.id} td",
                                        text: I18n.t('user.emails.email.primary'))
        end
      end
    end

    scenario 'I can add new emails' do
      invalid_email = 'test@@example'
      valid_email = build(:user_email).email
      fill_in 'user_email_email', with: invalid_email

      click_button I18n.t('user.emails.index.add')
      expect(page).to have_selector('div.alert-danger')

      fill_in 'user_email_email', with: valid_email
      click_button I18n.t('user.emails.index.add')
      expect(page).to have_selector('tr td', text: valid_email)
    end

    scenario 'I can delete a email' do
      email_to_delete = user.reload.emails.sample
      expect do
        find_link(nil, href: user_email_path(email_to_delete)).click
      end.to change { user.emails.count }.by(-1)

      expect(page).to have_selector('div.alert.alert-success')
    end

    scenario 'I can set an email as primary' do
      email_to_be_set_as_primary = confirmed_emails.sample
      find_link(nil, href: set_primary_user_email_path(email_to_be_set_as_primary)).click
      expect(email_to_be_set_as_primary.reload).to be_primary
    end

    scenario 'I can request a new confirmation email' do
      find_link(nil, href: send_confirmation_user_email_path(unconfirmed_email)).click
      expect(page).to have_selector('div.alert.alert-success',
                                    text: I18n.t('user.emails.send_confirmation.success'))
    end
  end
end
