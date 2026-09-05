# frozen_string_literal: true
module AuthenticationPerformersTestHelpers
  include Warden::Test::Helpers

  alias_method :warden_logout, :logout

  def login_as(user, **kwargs)
    # For some reasons, sometimes new scenarios are automatically logged in as the previous user.
    # Clearing cookies isn't enough and subsequent requests still carries over an old, authenticated
    # session cookie. We force the server to log out all remaining sessions before logging in.
    # warden_logout

    visit new_user_session_path(next: kwargs[:redirect_url])

    fill_in 'Email', with: user.email
    fill_in 'Password', with: password_for(user)
    click_button 'Sign In'

    # We expect all authenticated pages should have a user menu button.
    expect(page).to have_css('div[data-testid="user-menu-button"]')
  end

  # The Logout button this used to click was Keycloak's logout confirmation page, shown only because
  # the client cleared its stored auth state before signoutRedirect could read the ID token out of
  # it. With id_token_hint restored, Keycloak ends the session without prompting.
  def logout(*_)
    find('div[data-testid="user-menu-button"]').click
    wait_for_animation
    find('li', text: 'Sign out').click
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
