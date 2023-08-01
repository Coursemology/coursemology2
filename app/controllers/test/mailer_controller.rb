# frozen_string_literal: true
class Test::MailerController < Test::Controller
  def last_sent
    render json: ActionMailer::Base.deliveries.last
  end

  def clear
    ActionMailer::Base.deliveries.clear

    head :ok
  end
end
