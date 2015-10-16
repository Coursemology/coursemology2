class Course::Forum < ActiveRecord::Base
  extend FriendlyId
  friendly_id :slug_candidates, use: :slugged

  belongs_to :course, inverse_of: :forums
  has_many :topics, dependent: :destroy, inverse_of: :forum
  has_many :subscriptions, dependent: :destroy, inverse_of: :forum

  private

  # Try building a slug based on the following fields in
  # increasing order of specificity.
  def slug_candidates
    [
      :name,
      [:name, :course_id]
    ]
  end
end
