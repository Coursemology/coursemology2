# frozen_string_literal: true
class Notifier::Base::ActivityWrapper < SimpleDelegator
  # Send notifications according to input type and recipient
  #
  # @param [Object] recipient The recipient of the notification
  # @param [Symbol] type The type of notification
  def notify(recipient, type)
    super(recipient, type).tap do |notification|
      @notifier.send(:notify, recipient, notification)
    end

    self
  end

  # Save activity and send out pending emails
  def save(*)
    super.tap { |result| send_pending_email if result }
  end

  def save!(*)
    super.tap { |_| send_pending_email }
  end

  def initialize(notifier, activity) #:nodoc:
    super(activity)
    @notifier = notifier
  end

  private

  def send_pending_email
    execute_after_commit { @notifier.send(:send_pending_emails) }
  end
end
