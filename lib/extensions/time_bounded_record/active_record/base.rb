# frozen_string_literal: true
module Extensions::TimeBoundedRecord::ActiveRecord::Base
  module ClassMethods
    def currently_active
      started.merge(ended)
    end

    private

    def started
      where.has { (start_at == nil) | (start_at <= Time.zone.now) }
    end

    def ended
      where.has { (end_at == nil) | (end_at >= Time.zone.now) }
    end
  end

  # @return [Boolean] True if start_at is a future time.
  def started?
    !start_at.present? || start_at <= Time.zone.now
  end

  # @return [Boolean] True if current time is between start_at and end_at.
  def currently_active?
    started? && !ended?
  end

  # @return [Boolean] True if end_at is a past time.
  def ended?
    end_at.present? && Time.zone.now > end_at
  end
end
