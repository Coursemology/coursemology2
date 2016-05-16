# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingFileAnnotation < ActiveRecord::Base
  acts_as :discussion_topic, class_name: Course::Discussion::Topic.name

  belongs_to :file, class_name: Course::Assessment::Answer::ProgrammingFile.name,
                    inverse_of: :annotations

  # Get all discussion topic ids of type `Course::Assessment::Answer::ProgrammingFileAnnotation` in
  # the given course.
  scope :from_course, (lambda do |course_id|
    joins { file.answer.answer.question.assessment.tab.category }.
      where { file.answer.answer.question.assessment.tab.category.course_id == course_id }.
      joins { discussion_topic }.select { discussion_topic.id }
  end)
end
