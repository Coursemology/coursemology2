# frozen_string_literal: true.
class Course::Video::Statistic < ApplicationRecord
  belongs_to :cacheable, inverse_of: :statistic, polymorphic: true
end
