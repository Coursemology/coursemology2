# frozen_string_literal: true
class Test::MailerController < Test::Controller
  def sent
    render json: ActionMailer::Base.deliveries
  end

  def clear
    ActionMailer::Base.deliveries.clear

    head :ok
  end
end
