# frozen_string_literal: true
module Course::Forum::TopicControllerLockingConcern
  extend ActiveSupport::Concern

  def set_locked
    if @topic.update(locked_params)
      head :ok
    else
      render json: { errors: @topic.errors }, status: :bad_request
    end
  end

  private

  def locked_params
    params.permit(:locked)
  end
end
