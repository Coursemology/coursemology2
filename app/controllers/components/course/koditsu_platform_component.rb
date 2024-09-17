# frozen_string_literal: true
class Course::KoditsuPlatformComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.koditsu_platform.name')
  end

  def self.enabled_by_default?
    false
  end
end
