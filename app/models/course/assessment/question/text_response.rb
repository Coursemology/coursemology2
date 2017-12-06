# frozen_string_literal: true
class Course::Assessment::Question::TextResponse < ApplicationRecord
  acts_as :question, class_name: Course::Assessment::Question.name

  validate :validate_grade

  has_many :groups, class_name: Course::Assessment::Question::TextResponseGroup.name,
                    dependent: :destroy, foreign_key: :question_id, inverse_of: :question

  accepts_nested_attributes_for :groups, allow_destroy: true

  def auto_gradable?
    groups.map(&:auto_gradable_group?).any?
  end

  # Method provides readability to identifying whether a question is a file upload question.
  #  Used with the front-end translations.
  def file_upload_question?
    hide_text
  end

  # Method provides readability to identifying whether a question is a
  # (GCE A-Level General Paper) comprehension question.
  def comprehension_question?
    is_comprehension
  end

  def question_type
    if file_upload_question?
      I18n.t('activerecord.attributes.models.course/assessment/question/text_response.file_upload')
    elsif comprehension_question?
      I18n.t('activerecord.attributes.models.course/assessment/question/text_response.comprehension')
    else
      I18n.t('activerecord.attributes.models.course/assessment/question/text_response.text_response')
    end
  end

  def auto_grader
    Course::Assessment::Answer::TextResponseAutoGradingService.new
  end

  def attempt(submission, last_attempt = nil)
    answer =
      Course::Assessment::Answer::TextResponse.new(submission: submission, question: question)
    if last_attempt
      answer.answer_text = last_attempt.answer_text
      if last_attempt.attachment_references.any?
        answer.attachment_references = last_attempt.attachment_references.map(&:dup)
      end
    end
    answer.acting_as
  end

  def downloadable?
    true
  end

  def initialize_duplicate(duplicator, other)
    copy_attributes(other)
    associate_duplicated_skills(duplicator, other)

    self.groups = duplicator.duplicate(other.groups)
  end

  private

  def validate_grade
    groups.each do |group|
      group.points.each do |point|
        point.solutions.each do |s|
          return errors.add(:maximum_grade, :invalid_grade) if s.grade > maximum_grade
        end
      end
    end
  end
end
