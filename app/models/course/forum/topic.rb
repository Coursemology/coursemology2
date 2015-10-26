class Course::Forum::Topic < ActiveRecord::Base
  extend FriendlyId
  friendly_id :slug_candidates, use: :scoped, scope: :forum

  acts_as :topic, class_name: Course::Discussion::Topic.name, inverse_of: :actable

  enum topic_type: { normal: 0, question: 1, sticky: 2, announcement: 3 }

  has_many :views, dependent: :destroy, inverse_of: :topic
  belongs_to :forum, inverse_of: :topics

  private

  # Try building a slug based on the following fields in
  # increasing order of specificity.
  def slug_candidates
    [
      :title,
      [:title, :forum_id]
    ]
  end
end
