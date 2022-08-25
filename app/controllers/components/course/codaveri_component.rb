# frozen_string_literal: true
class Course::CodaveriComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.enabled_by_default?
    false
  end

  def self.display_name
    I18n.t('components.codaveri.name')
  end

  def sidebar_items
    []
  end
end
