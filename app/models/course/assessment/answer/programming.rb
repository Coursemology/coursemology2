# frozen_string_literal: true
class Course::Assessment::Answer::Programming < ActiveRecord::Base
  # The table name for this model is singular.
  self.table_name = table_name.singularize

  acts_as :answer, class_name: Course::Assessment::Answer.name

  has_many :files, class_name: Course::Assessment::Answer::ProgrammingFile.name,
                   foreign_key: :answer_id, dependent: :destroy, inverse_of: :answer

  accepts_nested_attributes_for :files, allow_destroy: true

  def to_partial_path
    'course/assessment/answer/programming/programming'.freeze
  end

  # Specific implementation of Course::Assessment::Answer#reset_answer
  def reset_answer
    self.class.transaction do
      files.clear
      question.specific.copy_template_files_to(self)
      raise ActiveRecord::Rollback unless save
    end
    acting_as
  end
end
