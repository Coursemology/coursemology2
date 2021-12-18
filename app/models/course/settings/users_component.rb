# frozen_string_literal: true
class Course::Settings::UsersComponent < Course::Settings::Component
  def self.component_class
    Course::UsersComponent
  end
end
