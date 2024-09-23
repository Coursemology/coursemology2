# frozen_string_literal: true
module AuthenticationPerformersTestHelpers
  include Warden::Test::Helpers

  alias_method :warden_logout, :logout

  def login_as(user, _ = {})
    # For some reasons, sometimes new scenarios are automatically logged in as the previous user.
    # Clearing cookies isn't enough and subsequent requests still carries over an old, authenticated
    # session cookie. We force the server to log out all remaining sessions before logging in.
    # warden_logout

    visit new_user_session_path

    fill_in 'Email', with: user.email
    fill_in 'Password', with: password_for(user)
    click_button 'Sign In'

    # We expect all authenticated pages should have a user menu button.
    expect(page).to have_css('div[data-testid="user-menu-button"]')
  end

  def logout(*_)
    find('div[data-testid="user-menu-button"]').click
    find('li', text: 'Sign out').click
    click_button('Logout')
    expect(page).to_not have_css('div[data-testid="user-menu-button"]')
  end

  private

  def password_for(user)
    user.password || Application::Application.config.x.default_user_password
  end
end

RSpec.configure do |config|
  config.include AuthenticationPerformersTestHelpers, type: :feature
end
