# frozen_string_literal: true
module Course::Forum::TopicControllerHidingConcern
  extend ActiveSupport::Concern

  def set_hidden
    if @topic.update(hidden_params)
      head :ok
    else
      render json: { errors: @topic.errors }, status: :bad_request
    end
  end

  private

  def hidden_params
    params.permit(:hidden)
  end
end
