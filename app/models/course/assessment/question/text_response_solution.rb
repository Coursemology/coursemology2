class Course::Assessment::Question::TextResponseSolution < ActiveRecord::Base
  enum solution_type: [:exact_match, :keyword]

  # validate grade <= max grade?

  belongs_to :question, class_name: Course::Assessment::Question::TextResponse.name,
                        inverse_of: :solutions

end
