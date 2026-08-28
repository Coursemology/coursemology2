# frozen_string_literal: true
# Gates the mounted Sidekiq Web dashboard on the same credentials as the rest of the app.
#
# Sidekiq::Web is a Rack app mounted in the router, so it never reaches ApplicationController and
# cannot use ApplicationUserConcern. Including ApplicationAuthenticationConcern keeps token
# handling in exactly one place; the two shims below stand in for the ActionController methods it
# expects, both of which a routing constraint can answer trivially.
class SidekiqAdminConstraint
  include ApplicationAuthenticationConcern

  # The router calls +matches?+ on whatever object it is handed, so the class itself is the
  # constraint and every request gets a fresh instance. That is load-bearing: the concern
  # memoises the decoded token per instance, and a single shared instance would hand the first
  # admin's identity to everyone who came after them.
  def self.matches?(request)
    new(request).admin?
  end

  def initialize(request)
    @request = request
  end

  def admin?
    user = current_user_from_token
    user.present? && user.administrator?
  end

  # True when the request carries no usable credential at all. Lets the router bounce visitors to
  # the sign in page while still 404ing signed-in non-admins, who have nothing to gain from being
  # told the dashboard is there.
  def signed_out?
    current_user_from_token.blank?
  end

  private

  attr_reader :request

  # Stands in for ActionController::Cookies#cookies, which is this and nothing more.
  def cookies
    request.cookie_jar
  end

  # Stands in for ActionController::Metal#performed?. A constraint cannot render, so no response
  # has ever been performed by the time the concern checks.
  def performed?
    false
  end
end
