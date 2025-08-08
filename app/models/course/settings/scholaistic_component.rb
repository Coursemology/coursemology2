# frozen_string_literal: true
class Course::Settings::ScholaisticComponent < Course::Settings::Component
  include ActiveModel::Conversion

  def assessments_title
    settings.assessments_title
  end

  def assessments_title=(assessments_title)
    settings.assessments_title = assessments_title.presence
  end

  def integration_key
    settings.integration_key
  end

  def integration_key=(integration_key)
    settings.integration_key = integration_key.presence
  end

  def last_synced_at
    settings.last_synced_at
  end

  def last_synced_at=(last_synced_at)
    settings.last_synced_at = last_synced_at.presence
  end
end
