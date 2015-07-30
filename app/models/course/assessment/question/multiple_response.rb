class Course::Assessment::Question::MultipleResponse < ActiveRecord::Base
  acts_as :question, class_name: Course::Assessment::Question.name, inverse_of: :actable

  enum question_type: [:all_correct, :any_correct]

  has_many :options, class_name: Course::Assessment::Question::MultipleResponseOption.name,
                     dependent: :destroy, foreign_key: :question_id, inverse_of: :question

  accepts_nested_attributes_for :options
end
