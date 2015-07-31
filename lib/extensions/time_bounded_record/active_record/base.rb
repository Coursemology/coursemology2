module Extensions::TimeBoundedRecord::ActiveRecord::Base
  module ClassMethods
    def currently_valid
      now_valid.merge(not_yet_expired)
    end

    private

    def now_valid
      where { (start_at == nil) | (start_at <= Time.zone.now) }
    end

    def not_yet_expired
      where { (end_at == nil) | (end_at >= Time.zone.now) }
    end
  end

  # @return [boolean] True if start_at is a future time
  def not_yet_valid?
    start_at.present? && start_at > Time.zone.now
  end

  # @return [boolean] True if current time is between start_at and end_at
  def currently_valid?
    (start_at.nil? || start_at <= Time.zone.now) &&
      (end_at.nil? || end_at >= Time.zone.now)
  end

  # @return [boolean] True if end_at is a past time
  def expired?
    end_at.present? && Time.zone.now > end_at
  end
end
