class Course::Discussion::Post < ActiveRecord::Base
  acts_as_forest order: :created_at

  belongs_to :topic, inverse_of: :posts
end
