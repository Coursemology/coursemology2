# frozen_string_literal: true
class Course::Settings::RagWiseComponent < Course::Settings::Component
  include ActiveModel::Conversion

  def self.component_class
    Course::RagWiseComponent
  end

  def response_workflow
    settings.response_workflow || '0'
  end

  def response_workflow=(response_workflow)
    settings.response_workflow = response_workflow
  end

  def roleplay
    settings.roleplay || ''
  end

  def roleplay=(roleplay)
    settings.roleplay = roleplay
  end
end
