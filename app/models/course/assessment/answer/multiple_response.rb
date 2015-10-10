class Course::Assessment::Answer::MultipleResponse < ActiveRecord::Base
  acts_as :answer, class_name: Course::Assessment::Answer.name, inverse_of: :actable

  has_many :answer_options, class_name: Course::Assessment::Answer::MultipleResponseOption.name,
                            dependent: :destroy, foreign_key: :answer_id, inverse_of: :answer
  has_many :options, through: :answer_options
end
