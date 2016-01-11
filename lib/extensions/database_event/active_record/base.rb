module Extensions::DatabaseEvent::ActiveRecord::Base
  module ClassMethods
    # Waits for the given +NOTIFY+ signal, optionally until a give time, or until a specific
    # condition is met.
    #
    # @param [Fixnum|nil] timeout The timeout to wait for a message. A +nil+ or zero timeout will
    #   wait indefinitely. The timeout applies to the total time waiting for a notification, even
    #   if the function waits multiple times.
    # @param [Proc|nil] while_callback The callback that will be called after the +LISTEN+ statement
    #   is sent, and is used to check to see if the library should continue waiting for a
    #   notification. If this returns +false+, the named of the last received notification is
    #   returned. If no notification was received yet (i.e. before the first wait), this returns
    #   +false+.
    # @return [Boolean] If a +while+ callback was specified and it returned
    #   false before the first wait, this returns false.
    # @return [String] Otherwise, this returns the notification received.
    # @return [nil] If the notification received is +nil+.
    def wait(identifier, timeout: nil, while_callback: nil, &block)
      deadline = timeout ? Time.zone.now + timeout : nil
      connection.execute("LISTEN #{identifier};")

      return false if while_callback && while_callback.call == false
      wait_until(deadline, while_callback, &block)
    ensure
      connection.execute('UNLISTEN *;')
    end

    # Signals to possible waiting consumers on this record.
    def signal(identifier)
      connection.execute("NOTIFY #{identifier};")
    end

    private

    # Waits until the deadline, or while_callback returns false.
    #
    # @param [Time|nil] deadline The deadline to wait until.
    # @param [Proc|nil] while_callback The loop will keep waiting until this returns a truthy value.
    # @return [String] Returns the notified event if the deadline has not elasped.
    # @return [nil] If the deadline elasped.
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
  # @param [Fixnum|nil] timeout The timeout to wait for a message. A +nil+ or zero timeout will
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
    to_global_id.to_s[18..-1]. # Remove gid://application/
      tr('/:', '_'). # Remove / and :
      underscore
  end
end
