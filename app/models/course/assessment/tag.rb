class Course::Assessment::Tag < ActiveRecord::Base
  belongs_to :tag_group, class_name: Course::Assessment::TagGroup.name, inverse_of: :tags
  has_and_belongs_to_many :questions, class_name: Course::Assessment::Question.name
end
