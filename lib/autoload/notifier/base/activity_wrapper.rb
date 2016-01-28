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
    super.tap do |result|
      @notifier.send(:send_pending_emails) if result
    end
  end

  def initialize(notifier, activity) #:nodoc:
    super(activity)
    @notifier = notifier
  end
end
