# frozen_string_literal: true
class Course::Settings::UsersComponent < Course::Settings::Component
  include Course::Settings::EmailSettingsConcern

  def self.email_setting_items
    {
      new_enrol_request: { enabled_by_default: true }
    }
  end

  def self.component_class
    Course::UsersComponent
  end
end
