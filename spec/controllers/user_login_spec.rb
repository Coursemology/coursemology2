require 'rails_helper'

RSpec.describe Devise::SessionsController, type: :controller do
  controller do
  end

  requires_login

  context 'Users with multiple email addresses' do
    describe 'Log in' do
      let(:password) { 'lolololol' }
      let(:user) { create(:user, emails_count: 2) }

      it 'allows users to log in with their primary email address' do
        post :create,
             user: {
               email: user.email,
               password: user.password
             }
        expect(flash[:notice]).to include('success')
      end

      it 'allows users to log in with their secondary email address' do
        post :create,
             user: {
               email: user.emails.reject { |email_record| email_record.primary }.first.email,
               password: user.password
             }
        expect(flash[:notice]).to include('success')
      end
    end
  end

end
