# frozen_string_literal: true
class User::MasqueradesController < Devise::MasqueradesController
  before_action :load_and_authorize_user, except: [:back]

  private

  def load_and_authorize_user
    authorize!(:masquerade, User)
  end
end
