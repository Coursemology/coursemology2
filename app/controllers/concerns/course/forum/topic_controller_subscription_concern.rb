# frozen_string_literal: true
module Course::Forum::TopicControllerSubscriptionConcern
  extend ActiveSupport::Concern

  def subscribe
    authorize!(:read, @topic)
    if set_subscription_state
      head :ok
    else
      render json: { errors: @topic.errors }, status: :bad_request
    end
  end

  private

  def set_subscription_state
    if subscribe?
      @topic.subscriptions.create(user: current_user)
    else
      @topic.subscriptions.where(user: current_user).destroy_all
    end
  end

  def subscribe?
    params[:subscribe] == true
  end
end
