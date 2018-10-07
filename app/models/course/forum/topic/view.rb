# frozen_string_literal: true
class Course::Forum::Topic::View < ApplicationRecord
  validates_presence_of :topic
  validates_presence_of :user

  belongs_to :topic, class_name: Course::Forum::Topic.name, inverse_of: :views
  belongs_to :user, inverse_of: nil
end
