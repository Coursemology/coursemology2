# frozen_string_literal: true

# Controllers that are accessible via OAuth must explicitly annotate itself to be accessible.
# The easiest way is by using the `accessible_in_oauth_scopes` hook. Anywhere in the controller,
# you can call `accessible_in_oauth_scopes` with an array of symbols that correspond to any one
# or more of `default_scopes` or `optional_scopes` defined in `config/initializers/doorkeeper.rb`.
#
# accessible_in_oauth_scopes :read_everything
# accessible_in_oauth_scopes :read_resource, only: [:index, :show]
# accessible_in_oauth_scopes [:read_everything, :write_everything], except: [:special_action]
#
# The `options` that `accessible_in_oauth_scopes` accepts are the same as
# `AbstractController::Callbacks`'s.
#
# If multiple annotations are present, the scopes will be merged together according to the
# conditions that prevail at request runtime. Orders of scope do not matter.
#
# If custom logic is needed, you can override `accessible_in_oauth_scopes` to return an array of
# symbols/strings of scopes that must be acceptable by the token for the request to go through.
#
# def accessible_in_oauth_scopes
#   if some_condition?
#     :read_everything
#   elsif another_condition?
#     [:read_some, :write_some]
#   end
# end
#
# If both `accessible_in_oauth_scopes` override and callback hook are present, the former will be
# evaluated first. Only if the former returns falsey will the latter be take precedence.
module ApplicationUserOauthConcern
  extend ActiveSupport::Concern

  module ClassMethods
    private

    def accessible_in_oauth_scopes(scopes, options = {})
      prepend_before_action (lambda do
        wrapped_scopes = Array.wrap(scopes)
        @oauth_scopes = @oauth_scopes&.concat(wrapped_scopes) || wrapped_scopes
      end), options
    end
  end

  protected

  def accessible_in_oauth_scopes
  end

  private

  def current_user_from_doorkeeper
    User.find(doorkeeper_token.resource_owner_id) if accessible_doorkeeper_token?
  end

  def accessible_doorkeeper_token?
    scopes = accessible_in_oauth_scopes || @oauth_scopes
    scopes.present? ? doorkeeper_token&.acceptable?(scopes) : false
  end
end
