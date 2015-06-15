class Course < ActiveRecord::Base
  include Course::LevelsConcern
  acts_as_tenant(:instance)
  has_settings_on :settings
  stampable

  after_initialize :set_defaults, if: :new_record?
  before_validation :set_defaults, if: :new_record?

  enum status: { closed: 0, published: 1, opened: 2 }

  belongs_to :creator, class_name: User.name
  has_many :course_users, inverse_of: :course, dependent: :destroy
  has_many :users, through: :course_users

  has_many :announcements, inverse_of: :course, dependent: :destroy
  has_many :achievements, inverse_of: :course, dependent: :destroy
  has_many :levels, inverse_of: :course, dependent: :destroy
  has_many :groups, inverse_of: :course, dependent: :destroy, class_name: Course::Group.name
  has_many :lesson_plan_items, inverse_of: :course, dependent: :destroy

  delegate :staff, to: :course_users
  delegate :has_user?, to: :course_users

  def self.use_relative_model_naming?
    true
  end

  private

  # Set default values
  def set_defaults
    self.start_at ||= Time.zone.now
    self.end_at ||= 1.month.from_now

    course_users.build(user: creator, role: :owner, workflow_state: :approved, creator: creator,
                       updater: updater) if creator && course_users.empty?
  end
end
