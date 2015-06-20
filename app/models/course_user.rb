class CourseUser < ActiveRecord::Base
  include Workflow
  after_initialize :set_defaults, if: :new_record?
  before_validation :set_defaults, if: :new_record?

  stampable

  enum role: { student: 0, teaching_assistant: 1, manager: 2, owner: 3 }

  # A set of roles which comprise the staff of a course.
  STAFF_ROLES = Set[:teaching_assistant, :manager, :owner].freeze

  workflow do
    state :requested do
      event :approve, transitions_to: :approved
      event :reject, transitions_to: :rejected
    end
    state :invited do
      event :accept, transitions_to: :approved
    end
    state :approved
    state :rejected
  end

  validates :user, presence: true, unless: :invited?

  belongs_to :user, inverse_of: :course_users
  belongs_to :course, inverse_of: :course_users
  has_many :experience_points_records, class_name: Course::ExperiencePointsRecord.name,
                                       inverse_of: :course_user, dependent: :destroy do
    def experience_points
      sum(:points_awarded)
    end
  end
  has_one :invitation, class_name: Course::UserInvitation.name, dependent: :destroy

  # Gets the staff associated with the course.
  # TODO: Remove the map when Rails 5 is released.
  scope :staff, -> { where(role: STAFF_ROLES.map { |x| roles[x] }) }
  scope :students, -> { where(role: roles[:student]) }

  delegate :experience_points, to: :experience_points_records

  # Test whether the current scope includes the current user.
  #
  # @param [User] user The user to check
  # @return [Boolean] True if the user exists in the current context
  def self.has_user?(user)
    with_approved_state.exists?(user: user)
  end

  # Computes the level number of the CourseUser with respect to
  # a course's Course::Levels.
  #
  # @return [Fixnum] CourseUser level number
  def level_number
    course.compute_level_number(experience_points)
  end

  # Test whether this course_user is a staff (i.e. teaching_assistant, manager or owner)
  #
  # @return [Boolean] True if course_user is a staff
  def staff?
    STAFF_ROLES.include?(role.to_sym)
  end

  # Transitions the user from the invited to the accepted state.
  #
  # @param [User] user The user which is accepting this invitation.
  # @return [void]
  def accept(user)
    self.user = user
  end

  # Callback handler for workflow state change to the rejected state.
  def on_rejected_entry(*)
    destroy
  end

  private

  def set_defaults # :nodoc:
    self.name ||= user.name if user
  end
end
