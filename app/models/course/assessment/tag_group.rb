class Course::Assessment::TagGroup < ActiveRecord::Base
  has_many :tags
end
