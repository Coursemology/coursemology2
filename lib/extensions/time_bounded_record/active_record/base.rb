module Extensions::TimeBoundedRecord::ActiveRecord::Base
  module ClassMethods
    def currently_valid
      where do
        (valid_from.nil? || valid_from <= Time.zone.now) &&
          (valid_to.nil? || valid_to >= Time.zone.now)
      end
    end
  end

  # @return [boolean] True if valid_from is a future time
  def not_yet_valid?
    !valid_from.nil? && valid_from > Time.zone.now
  end

  # @return [boolean] True if current time is between valid_from and valid_to
  def currently_valid?
    (valid_from.nil? || valid_from <= Time.zone.now) &&
      (valid_to.nil? || valid_to >= Time.zone.now)
  end

  # @return [boolean] True if valid_to is a past time
  def expired?
    !valid_to.nil? && Time.zone.now > valid_to
  end
end
