class Course::Assessment::Question::MultipleResponseOption < ActiveRecord::Base
  belongs_to :question, class_name: Course::Assessment::Question::MultipleResponse.name,
                        inverse_of: :options
end
