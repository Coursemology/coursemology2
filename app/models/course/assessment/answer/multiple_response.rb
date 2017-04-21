# frozen_string_literal: true
class Course::Assessment::Answer::MultipleResponse < ActiveRecord::Base
  acts_as :answer, class_name: Course::Assessment::Answer.name

  has_many :answer_options, class_name: Course::Assessment::Answer::MultipleResponseOption.name,
                            dependent: :destroy, foreign_key: :answer_id, inverse_of: :answer
  has_many :options, through: :answer_options

  # Multiple Response Questions (MRQs) options are displayed in forms using radio buttons if they
  # are Multiple Choice Questions (MCQs), otherwise, they are displayed using checkboxes. This
  # method allows the radio button for the selected MCQ option to be marked as checked when the
  # form is generated for display.
  #
  # In both the MCQ and non-MCQ cases, the options are rendered using the same custom simple_form
  # input component which delegates the rendering to either a radio button or checkbox renderer
  # as appropriate. The radio button renderer expects the attribute (i.e. #option_ids) to return
  # an element, not an array of elements.
  def override_option_ids_method_for_form_display!
    define_singleton_method(:option_ids) do
      ids = super()
      if question.specific.multiple_choice?
        raise IllegalStateError if ids.size > 1
        ids[0]
      else
        ids
      end
    end
  end

  # Specific implementation of Course::Assessment::Answer#reset_answer
  def reset_answer
    options.clear
    acting_as
  end

  def assign_params(params)
    acting_as.assign_params(params)
    if params[:option_ids]
      option_ids = params[:option_ids].map(&:to_i)
      self.options = question.specific.options.select { |option| option_ids.include?(option.id) }
    end
  end
end
