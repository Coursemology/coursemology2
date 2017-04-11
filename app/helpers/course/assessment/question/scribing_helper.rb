# frozen_string_literal: true
module Course::Assessment::Question::ScribingHelper
  # Determines if the scribing question errors should be displayed.
  #
  # @return [Boolean]
  def display_validation_errors?
    @scribing_question.errors.present?
  end

  # Displays the validation errors alert for scribing question.
  #
  # @return [String] If there are validation errors for the question.
  # @return [nil] If there are no validation errors for the question.
  def validation_errors_alert
    return nil if @scribing_question.errors.empty?

    content_tag(:div, class: ['alert', 'alert-danger']) do
      messages = @scribing_question.errors.full_messages.map do |message|
        content_tag(:div, message)
      end

      safe_join messages
    end
  end
end
