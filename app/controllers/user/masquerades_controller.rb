# frozen_string_literal: true
class User::MasqueradesController < Devise::MasqueradesController
  before_action :load_and_authorize_user, except: [:back]

  private

  def load_and_authorize_user
    @user = User.find(id_param)
    authorize!(:masquerade, @user)
  end

  def id_param
    params.permit(:id)[:id]
  end
end
