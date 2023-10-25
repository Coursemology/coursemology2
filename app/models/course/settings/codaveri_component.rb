# frozen_string_literal: true
class Course::Settings::CodaveriComponent < Course::Settings::Component
  include ActiveModel::Conversion

  def self.component_class
    Course::CodaveriComponent
  end

  # Returns the feedback generation workflow: no feedback, draft feedback or published feedback
  #
  # @return [none|draft|publish] The feedback generation workflow in a course
  def feedback_workflow
    settings.feedback_workflow || 'draft'
  end

  # Returns the ITSP requirement of codaveri component
  #
  # @return [String] The custom or default ITSP requirement of codaveri component
  def is_only_itsp
    settings.is_only_itsp
  end

  # Sets the feedback workflow of codaveri feedback component
  #
  # @param [String] title The new ITSP requirement
  def feedback_workflow=(feedback_workflow)
    feedback_workflow = nil if feedback_workflow.nil?
    settings.feedback_workflow = feedback_workflow
  end

  # Sets the ITSP requirement of codaveri component
  #
  # @param [String] title The new ITSP requirement
  def is_only_itsp=(is_only_itsp)
    is_only_itsp = nil if is_only_itsp.nil?
    settings.is_only_itsp = is_only_itsp
  end
end
