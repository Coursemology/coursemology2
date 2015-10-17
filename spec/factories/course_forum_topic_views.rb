FactoryGirl.define do
  factory :forum_topic_view, class: Course::Forum::Topic::View.name do
    topic { create(:forum_topic) }
    user
  end
end
