# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Users: Change password' do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:user) { create(:user) }
    before { login_as(user, scope: :user) }

    context 'As a User' do
      scenario 'I am able to change my password' do
        visit edit_user_profile_path
      end
    end
  end
end
