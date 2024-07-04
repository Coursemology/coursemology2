# frozen_string_literal: true
class FilenameValidator < ActiveModel::Validator
  def validate(record)
    errors = record.errors
    # \ : * ? " < > | are not allowed
    if record.name =~ /[\/\\:*?"<>|]/
      errors.add(:name, I18n.t('activerecord.errors.messages.filename_validator.invalid_characters',
                               characters: '\ : * ? " < > |'))
    # Tailing dots are not allowed
    elsif record.name =~ /\.+\z/
      errors.add(:name, I18n.t('activerecord.errors.messages.filename_validator.tailing_dots'))
    # Leading or tailing whitespaces are not allowed
    elsif record.name =~ /(\A\s+.*)|(.*\s+\z)/
      errors.add(:name, I18n.t('activerecord.errors.messages.filename_validator.whitespaces'))
    end
  end
end
