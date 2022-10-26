# frozen_string_literal: true
class User::ProfilesController < ApplicationController
  def edit
  end

  def update
    if current_user.update(profile_params)
      render 'edit'
    else
      render json: { errors: current_user.errors }, status: :bad_request
    end
  end

  def time_zones
    render 'course/admin/admin/time_zones'
  end

  private

  def profile_params
    params.require(:user).permit(:name, :time_zone, :profile_photo)
  end
end
