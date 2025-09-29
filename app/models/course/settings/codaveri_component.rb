# frozen_string_literal: true
class Course::Settings::CodaveriComponentValidator < ActiveModel::Validator
  def self.all_feedback_workflows
    ['none', 'draft', 'publish'].freeze
  end

  def self.all_models
    [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-o1',
      'gpt-o3',
      'gpt-o3-mini',
      'gpt-5',
      'gpt-5-mini',
      'gpt-5-nano',
      'gpt-4.1',
      'claude-4-sonnet',
      'claude-3-7-sonnet',
      'claude-3-5-sonnet',
      'claude-3-haiku',
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.0-flash'
    ].freeze
  end

  def validate(record)
    errors = record.errors
    unless self.class.all_feedback_workflows.include?(record.feedback_workflow)
      errors.add(:feedback_workflow, "Invalid feedback workflow: #{record.feedback_workflow}")
    end
    return if self.class.all_models.include?(record.model)

    errors.add(:model, "Invalid model: #{record.model}")
  end
end

# Settings for the codaveri component.
class Course::Settings::CodaveriComponent < Course::Settings::Component
  include ActiveModel::Conversion
  validates_with Course::Settings::CodaveriComponentValidator

  def self.component_class
    Course::CodaveriComponent
  end

  def self.default_settings
    {
      feedback_workflow: 'draft',
      model: 'gemini-2.5-pro',
      override_system_prompt: false,
      system_prompt: ''
    }.freeze
  end

  def self.add_default_settings(settings)
    settings.key :course_codaveri_component, defaults: default_settings
  end

  # Returns the feedback generation workflow: no feedback, draft feedback or published feedback
  #
  # @return [none|draft|publish] The feedback generation workflow in a course
  def feedback_workflow
    settings.feedback_workflow
  end

  # Returns the AI model used by Codaveri to generate feedback.
  # @return [String] The AI model
  def model
    settings.model
  end

  # Returns the system prompt entered by user to configure Codaveri.
  # @return [String] The system prompt
  def system_prompt
    settings.system_prompt
  end


  # Returns whether the user is overriding the default system prompt.
  # @return [Boolean] The system prompt
  def override_system_prompt
    settings.override_system_prompt
  end

  # Returns the ITSP requirement of codaveri component
  # NOTE: This setting is deprecated and should not be used.
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

  # Sets the AI model used by Codaveri to generate feedback.
  # @param [String] model The new AI model
  def model=(model)
    model = nil if model.nil?
    settings.model = model
  end

  # Sets the system prompt entered by user to configure Codaveri.
  # @param [String] system_prompt The new system prompt
  def system_prompt=(system_prompt)
    system_prompt = nil if system_prompt.nil?
    settings.system_prompt = system_prompt
  end

  # Sets whether to use the system prompt entered by user to configure Codaveri.
  # @param [Boolean] override_system_prompt The new setting
  def override_system_prompt=(override_system_prompt)
    override_system_prompt = nil if override_system_prompt.nil?
    settings.override_system_prompt = override_system_prompt
  end
end
