# frozen_string_literal: true
# Expires the +access_token+ cookie that ApplicationUserConcern writes.
#
# The cookie is httponly, so the client cannot clear it on its own: js-cookie deletes by writing
# through +document.cookie+, which an httponly cookie is invisible to by definition. Signing out
# therefore has to ask the server to expire it, or it outlives the sign out as a usable credential
# for browser-issued requests, which fall back to the cookie when no bearer token is present.
#
# A caller can only ever clear their own cookie. This action takes no parameters and identifies no
# user - it expires the cookie on the response to this very request, so the only browser it can
# affect is the one that made it.
class AccessTokenController < ApplicationController
  # +refresh_token_cookie+ would otherwise mint the cookie from this request's own bearer token
  # moments before the action deletes it. The net result is the same, but this endpoint should only
  # ever be capable of clearing a credential, never of issuing one.
  skip_before_action :refresh_token_cookie

  def destroy
    cookies.delete(:access_token)
    head :no_content
  end

  protected

  # Signing out has to work with a credential that has already lapsed, which is exactly when a
  # stale cookie is most likely to still be sitting in the browser.
  def publicly_accessible?
    true
  end
end
