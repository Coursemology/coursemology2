# frozen_string_literal: true
class User::ProfilesController < ApplicationController
  layout 'user_admin'

  def edit
  end

  def update
    if current_user.update(profile_params)
      redirect_to edit_user_profile_path, success: t('.success')
    else
      render 'edit'
    end
  end

  private

  def profile_params
    params.require(:user).permit(:name, :time_zone, :profile_photo)
  end
end
