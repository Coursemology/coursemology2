# frozen_string_literal: true
module Extensions::DatabaseEvent::ActiveRecord::Base
  module ClassMethods
    # Waits for the given +NOTIFY+ signal, optionally until a given time, or until a specific
    # condition is met.
    #
    # @param [String] identifier The +NOTIFY+ signal to wait for.
    # @param [Integer|nil] timeout The timeout to wait for a message. A +nil+ or zero timeout will
    #   wait indefinitely. The timeout applies to the total time waiting for a notification, even
    #   if the function waits multiple times.
    # @param [Proc|nil] while_callback The callback that will be called after the +LISTEN+ statement
    #   is sent, and is used to check to see if the library should continue waiting for a
    #   notification. If this returns +false+, the named of the last received notification is
    #   returned. If no notification was received yet (i.e. before the first wait), this returns
    #   +false+.
    # @return [Boolean] If a +while+ callback was specified and it returned
    #   false before the first wait, this returns false.
    # @return [String] If a notification was received.
    # @return [nil] If the timeout elapsed.
    def wait(identifier, timeout: nil, while_callback: nil, &block)
      deadline = timeout ? Time.zone.now + timeout : nil
      connection.execute("LISTEN #{identifier};")

      wait_for_identifier(identifier, deadline, while_callback, &block)
    ensure
      connection.execute("UNLISTEN #{identifier};")
    end

    # Signals to possible waiting consumers on this record.
    def signal(identifier)
      connection.execute("NOTIFY #{identifier};")
    end

    private

    # Waits for the given identifier to be signalled.
    #
    # @param [String] identifier The identifier to wait for.
    # @param [Time|nil] deadline The deadline to wait until.
    # @param [Proc|nil] while_callback The loop will keep waiting until this returns a truthy value.
    # @return [String] Returns the notified event if the deadline has not elapsed.
    # @return [nil] If the deadline elapsed.
    def wait_for_identifier(identifier, deadline, while_callback, &block)
      return false if while_callback && while_callback.call == false

      last_notification = false
      last_notification = wait_until(deadline, while_callback, &block) until
        last_notification.nil? || last_notification == identifier
      last_notification
    end

    # Waits until the deadline, or while_callback returns false.
    #
    # @param [Time|nil] deadline The deadline to wait until.
    # @param [Proc|nil] while_callback The loop will keep waiting until this returns a truthy value.
    # @return [String] Returns the notified event if the deadline has not elapsed.
    # @return [nil] If the deadline elapsed.
    def wait_until(deadline, while_callback, &block)
      while deadline.nil? || Time.zone.now < deadline
        wait_timeout = deadline ? deadline - Time.zone.now : nil
        result = connection.instance_variable_get(:@connection).
                 wait_for_notify(wait_timeout, &block)
        return result if while_callback.nil? || !while_callback.call
      end

      nil
    end
  end

  # Waits for a signal on the current record. A signal can be sent by using {#signal}.
  #
  # @param [Integer|nil] timeout The timeout to wait for a message. A +nil+ or zero timeout will
  #   wait indefinitely.
  # @param [Proc] while_callback The callback that will be called after the +LISTEN+ statement is
  #   sent, and is used to check to see if the library should continue waiting for a notification
  #   event. If this returns +false+, the named of the last received notification is returned. If no
  #   notification was received yet (i.e. before the first wait), this returns false.
  # @return [Boolean] If a +while+ callback was specified and it returned
  #   false before the first wait, this returns false.
  # @return [String] Otherwise, this returns the notification received.
  # @return [nil] If the notification received is +nil+.
  def wait(timeout: nil, while_callback: nil, &block)
    self.class.wait(notify_identifier, timeout: timeout, while_callback: while_callback, &block)
  end

  # Signals to possible waiting consumers on this record.
  def signal
    self.class.signal(notify_identifier)
  end

  private

  # A string identifier usable with the Postgres NOTIFY command.
  #
  # @return [String]
  def notify_identifier
    to_global_id.to_s[18..]. # Remove gid://application/
      tr('/:', '_'). # Remove / and :
      underscore
  end
end
