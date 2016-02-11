# frozen_string_literal: true
class User::MasqueradesController < Devise::MasqueradesController
  before_action :load_and_authorize_user, except: [:back]

  private

  def id_param
    params.permit(:id)[:id]
  end

  def load_and_authorize_user
    @user = User.find(id_param)
    authorize!(:masquerade, @user)
  end
end
