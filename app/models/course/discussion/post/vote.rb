# frozen_string_literal: true
class Course::Discussion::Post::Vote < ActiveRecord::Base
  belongs_to :post, inverse_of: :votes
end
