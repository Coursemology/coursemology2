# frozen_string_literal: true
class CourseAssessmentAnswerMultipleResponseInput < SimpleForm::Inputs::CollectionRadioButtonsInput
  def input_type
    check_boxes? ? :check_boxes : :radio_buttons
  end

  protected

  def check_boxes?
    !object.question.specific.multiple_choice?
  end

  def has_required? # rubocop:disable Naming/PredicateName
    !check_boxes?
  end

  def build_nested_boolean_style_item_tag(collection_builder)
    collection_builder.public_send(builder_input_type) +
      content_tag(:span, collection_builder.text, class: [correct_class(collection_builder.object)])
  end

  # Gets the CSS class for the answer's correct state.
  #
  # @param [Course::Assessment::Question::MultipleResponseOption] option The answer to get the
  #   correct class of.
  # @return [nil] When no solution is supposed to be displayed, or the option is incorrect.
  # @return [String] When the answer is correct.
  def correct_class(option)
    return nil unless options[:display_solution]
    option.correct? ? 'correct' : nil
  end

  def builder_input_type
    check_boxes? ? :check_box : :radio_button
  end

  def item_wrapper_class
    check_boxes? ? 'checkbox' : 'radio'
  end
end
