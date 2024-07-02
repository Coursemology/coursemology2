# frozen_string_literal: true
class Course::Forum::Topic::View < ApplicationRecord
  validates :topic, presence: true
  validates :user, presence: true

  belongs_to :topic, class_name: 'Course::Forum::Topic', inverse_of: :views
  belongs_to :user, inverse_of: nil
end
