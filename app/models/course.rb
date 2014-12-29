class Course < ActiveRecord::Base
  acts_as_tenant(:instance)
  # for automatic update userstamps
  stampable

  enum status: { closed: 0, published: 1, opened: 2 }
  belongs_to :creator, class_name: User.name
  has_many :course_users, inverse_of: :course, dependent: :destroy
  has_many :users, through: :course_users

  before_validation :set_default_values, on: :create

  private

  def set_default_values
    self.start_at ||= Time.now
    self.end_at ||= 1.month.from_now
  end
end
