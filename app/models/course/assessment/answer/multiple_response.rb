# frozen_string_literal: true
class Course::Assessment::Answer::MultipleResponse < ApplicationRecord
  acts_as :answer, class_name: Course::Assessment::Answer.name

  has_many :answer_options, class_name: Course::Assessment::Answer::MultipleResponseOption.name,
                            dependent: :destroy, foreign_key: :answer_id, inverse_of: :answer
  has_many :options, through: :answer_options

  # Specific implementation of Course::Assessment::Answer#reset_answer
  def reset_answer
    options.clear
    acting_as
  end

  def assign_params(params)
    acting_as.assign_params(params)
    return unless params[:option_ids]

    option_ids = params[:option_ids].map(&:to_i)
    self.options = question.specific.options.select { |option| option_ids.include?(option.id) }
  end

  def retrieve_random_seed
    self.random_seed ||= Random.new_seed
    save

    self.random_seed
  end

  def compare_answer(other_answer)
    return false unless other_answer.is_a?(Course::Assessment::Answer::MultipleResponse)

    Set.new(option_ids) == Set.new(other_answer.option_ids)
  end

  def csv_download
    ActionController::Base.helpers.strip_tags(options.map(&:option).join(';'))
  end
end
