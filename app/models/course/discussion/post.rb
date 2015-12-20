class Course::Discussion::Post < ActiveRecord::Base
  acts_as_forest order: :created_at

  after_initialize :set_topic, if: :new_record?
  validate :parent_topic_consistency

  belongs_to :topic, inverse_of: :posts

  scope :ordered_by_created_at, -> { order(created_at: :asc).includes(:creator).to_a }

  private

  def set_topic
    self.topic ||= parent.topic if parent
  end

  def parent_topic_consistency
    errors.add(:topic_inconsistent) if parent && topic != parent.topic
  end
end
