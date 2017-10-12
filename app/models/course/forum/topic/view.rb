# frozen_string_literal: true
class Course::Forum::Topic::View < ApplicationRecord
  belongs_to :topic, class_name: Course::Forum::Topic.name, inverse_of: :views
  belongs_to :user, inverse_of: nil
end
