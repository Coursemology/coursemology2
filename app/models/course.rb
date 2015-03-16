class Course < ActiveRecord::Base
  acts_as_tenant(:instance)
  stampable

  after_initialize :set_defaults, if: :new_record?

  enum status: { closed: 0, published: 1, opened: 2 }

  belongs_to :creator, class_name: User.name
  has_many :course_users, inverse_of: :course, dependent: :destroy
  has_many :users, through: :course_users

  has_many :announcements, inverse_of: :course, dependent: :destroy
  has_many :achievements, inverse_of: :course, dependent: :destroy
  has_many :levels, inverse_of: :course, dependent: :destroy

  delegate :staff, to: :course_users

  private

  # Set default values
  def set_defaults
    self.start_at ||= Time.now
    self.end_at ||= 1.month.from_now
  end
end
