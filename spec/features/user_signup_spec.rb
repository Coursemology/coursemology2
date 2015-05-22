require 'rails_helper'

RSpec.describe 'Users', type: :feature do
  before { visit new_user_registration_path }

  context 'with invalid information' do
    subject { click_button I18n.t('devise.registrations.new.sign_up') }
    it 'does not create a user' do
      expect { subject }.not_to change(User, :count)
    end
  end

  context 'with valid information' do
    let(:valid_user) { build(:user) }
    subject { click_button I18n.t('devise.registrations.new.sign_up') }

    before do
      fill_in 'user_name', with: valid_user.name
      fill_in 'user_email', with: valid_user.email
      fill_in 'user_password', with: valid_user.password
      fill_in 'user_password_confirmation', with: valid_user.password
    end

    it 'creates a user' do
      expect { subject }.to change(User, :count).by(1)
    end
  end
end
