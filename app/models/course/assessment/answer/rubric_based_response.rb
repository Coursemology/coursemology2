# frozen_string_literal: true
class Course::Assessment::Answer::RubricBasedResponse < ApplicationRecord
  acts_as :answer, class_name: 'Course::Assessment::Answer'

  after_initialize :set_default
  before_validation :strip_whitespace

  after_create :create_category_score_instances_for_answer

  has_many :scores, class_name: 'Course::Assessment::Answer::RubricBasedResponseScore',
                    dependent: :destroy, foreign_key: :answer_id, inverse_of: :answer

  # Specific implementation of Course::Assessment::Answer#reset_answer
  def reset_answer
    self.answer_text = ''
    save
    acting_as
  end

  def assign_params(params)
    acting_as.assign_params(params)
    self.answer_text = params[:answer_text] if params[:answer_text]
  end

  def csv_download
    ActionController::Base.helpers.strip_tags(answer_text)
  end

  def compare_answer(other_answer)
    return false unless other_answer.is_a?(Course::Assessment::Answer::RubricBasedResponse)

    answer_text == other_answer.answer_text
  end

  def create_category_score_instances
    answer.class.transaction do
      new_category_scores = question.specific.categories.map do |category|
        {
          answer_id: id,
          category_id: category.id,
          score: nil,
          explanation: category.is_bonus_category ? '' : nil
        }
      end

      categories = Course::Assessment::Answer::RubricBasedResponseScore.insert_all(new_category_scores)
      raise ActiveRecord::Rollback if !new_category_scores.empty? && (categories.nil? || categories.rows.empty?)
    end
  end

  private

  def set_default
    self.answer_text ||= ''
  end

  def strip_whitespace
    answer_text.strip!
  end
end
