require 'rails_helper'

RSpec.feature 'User: Emails' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let!(:user_emails) { create_list(:user_email, 2, user: user, primary: false) }
    before do
      login_as(user, scope: :user)
      visit user_emails_path
    end

    scenario 'I can view all my emails' do
      user.emails.each do |email|
        expect(page).to have_selector('tr td', text: email.email)
        it { is_expected.to have_selector('tr td', text: email.email) }
      end
    end

    scenario 'I can add new emails' do
      invalid_email = 'test@example'
      valid_email = build(:user_email).email
      fill_in 'user_email_email', with: invalid_email
      click_button 'add'
      it { is_expected.to have_selector('div.alert-danger') }

      fill_in 'user_email_email', with: valid_email
      click_button 'add'
      it { is_expected.to have_selector('tr td', text: valid_email) }
    end

    scenario 'I can delete a email' do
      email_to_delete = user.reload.emails.sample
      expect do
        find_link(nil, href: user_email_path(email_to_delete)).click
      end.to change { user.emails.count }.by(-1)

      it { is_expected.to have_selector('div.success') }
    end

    scenario 'I can set an email as primary' do
      email_to_be_set_as_primary = user.reload.emails.select { |e| !e.primary? }.sample
      find_link(nil, href: set_primary_user_email_path(email_to_be_set_as_primary)).click
      expect(email_to_be_set_as_primary.reload).to be_primary
    end
  end
end
