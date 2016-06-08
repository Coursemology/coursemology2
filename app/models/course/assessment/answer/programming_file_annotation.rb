# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingFileAnnotation < ActiveRecord::Base
  acts_as_discussion_topic display_globally: true

  belongs_to :file, class_name: Course::Assessment::Answer::ProgrammingFile.name,
                    inverse_of: :annotations

  after_initialize :set_course, if: :new_record?

  private

  # Set the course as the same course of the answer.
  def set_course
    self.course ||= file.answer.course if file && file.answer
  end
end
