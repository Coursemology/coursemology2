class Course::Forum::Topic::View < ActiveRecord::Base
  belongs_to :topic, class_name: Course::Forum::Topic.name, inverse_of: :views
  belongs_to :user, inverse_of: :topic_views
end
