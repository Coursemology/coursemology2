class CourseUser < ActiveRecord::Base
  include Workflow

  stampable
  belongs_to :user, inverse_of: :course_users
  belongs_to :course, inverse_of: :course_users
  has_many :experience_points_records, class_name: Course::ExperiencePointsRecord.name,
                                       inverse_of: :course_user, dependent: :destroy do
    def experience_points
      sum(:points_awarded)
    end
  end

  enum role: { student: 0, teaching_assistant: 1, manager: 2, owner: 3 }

  # A set of roles which comprise the staff of a course.
  #
  # The values are duplicated as strings and symbols so either can be used when querying.
  STAFF_ROLES = Set[:teaching_assistant, :manager, :owner].freeze
  # Gets the staff associated with the course.
  scope :staff, -> { where(role: STAFF_ROLES.map { |x| roles[x] }) }

  workflow do
    state :pending do
      event :approve, transitions_to: :approved
      event :reject, transitions_to: :rejected
    end
    state :approved
    state :rejected
  end

  delegate :experience_points, to: :experience_points_records

  # Test whether this course_user is a staff (i.e. teaching_assistant, manager or owner)
  #
  # @return [Boolean] True if course_user is a staff
  def staff?
    STAFF_ROLES.include?(role.to_sym)
  end
end
