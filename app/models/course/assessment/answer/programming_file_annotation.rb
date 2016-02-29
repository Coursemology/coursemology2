# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingFileAnnotation < ActiveRecord::Base
  acts_as :discussion_topic, class_name: Course::Discussion::Topic.name

  belongs_to :file, class_name: Course::Assessment::Answer::ProgrammingFile.name,
                    inverse_of: :annotations
end
