# frozen_string_literal: true
class TimeZoneValidator < ActiveModel::Validator
  # Custom time_zone validation as +#time_zone+ getter has been modified.
  #
  # Possible time_zones include +nil+ or those listed in ActiveSupport::TimeZone
  def validate(record)
    return if record[:time_zone].nil? || ActiveSupport::TimeZone[record[:time_zone]].present?

    record.errors.add(:time_zone,
                      I18n.t('activerecord.errors.messages.time_zone_validator.invalid_time_zone'))
  end
end
