# frozen_string_literal: true
# Discard mail delivery jobs that fail with permanent SMTP errors.
# These errors (e.g. invalid recipient address, authentication failure) cannot be
# resolved by retrying, so retrying only wastes queue resources.
#
# When discarding, we notify the originating record (e.g. a UserInvitation) by calling
# `mark_email_as_invalid` if it responds to that method. This lets models react to
# permanent delivery failures without coupling this initializer to specific mailers.
#
# For transient errors that allow retries, we also mark the record as invalid when
# all retry attempts are exhausted (via sidekiq_retries_exhausted hook).
Rails.application.config.after_initialize do
  ActionMailer::MailDeliveryJob.discard_on(Net::SMTPSyntaxError,
                                           Net::SMTPFatalError,
                                           Net::SMTPAuthenticationError) do |job, error|
    # MailDeliveryJob#perform signature: (mailer, mail_method, delivery_method, args:, kwargs: nil, params: nil)
    # job.arguments: ["Course::Mailer", "user_invitation_email", "deliver_now", { args: [record], ... }]
    args_hash = job.arguments[3]
    record = args_hash[:args]&.first
    record.mark_email_as_invalid(error) if record.respond_to?(:mark_email_as_invalid)
  end

  if Rails.env.production?
    # When retries are exhausted for transient errors (e.g. Net::SMTPServerBusy),
    # mark the record as invalid so it won't be retried again.
    ActionMailer::MailDeliveryJob.sidekiq_retries_exhausted do |msg, _exception|
      # Sidekiq job payload structure:
      # msg['args'] is an array with a single element (the ActiveJob serialized hash)
      # The hash contains 'arguments' key with the job's arguments
      job_data = msg['args'].first
      next unless job_data.is_a?(Hash)

      arguments = job_data['arguments']
      next unless arguments.is_a?(Array) && arguments.length >= 4

      args_hash = arguments[3]
      next unless args_hash.is_a?(Hash)

      # Deserialize the GlobalID to get the actual record
      serialized_record = args_hash['args']&.first
      next unless serialized_record.is_a?(Hash) && serialized_record['_aj_globalid']

      record = GlobalID::Locator.locate(serialized_record['_aj_globalid'])
      error = StandardError.new("Retries exhausted: #{msg['error_class']} - #{msg['error_message']}")
      record.mark_email_as_invalid(error) if record.respond_to?(:mark_email_as_invalid)
    end
  end
end
