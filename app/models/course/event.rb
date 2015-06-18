class Course::Event < ActiveRecord::Base
  acts_as_lesson_plan_item

  enum event_type: [:others, :lecture, :recitation, :tutorial]
end
