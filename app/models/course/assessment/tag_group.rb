# frozen_string_literal: true
class Course::Assessment::TagGroup < ActiveRecord::Base
  has_many :tags, inverse_of: :tag_group
end
