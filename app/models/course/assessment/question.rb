class Course::Assessment::Question < ActiveRecord::Base
  actable

  belongs_to :assessment, inverse_of: :questions
  has_and_belongs_to_many :tags
end
