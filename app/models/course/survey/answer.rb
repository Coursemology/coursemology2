# frozen_string_literal: true
class Course::Survey::Answer < ActiveRecord::Base
  actable

  belongs_to :response, inverse_of: :answers
  belongs_to :question, inverse_of: nil
end
