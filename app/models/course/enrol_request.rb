# frozen_string_literal: true
class Course::EnrolRequest < ApplicationRecord
  include Workflow

  workflow do
    state :pending do
      event :approve, transitions_to: :approved
      event :reject, transitions_to: :rejected
    end
    state :approved
    state :rejected
  end

  validate :validate_user_not_in_course, on: :create
  validates :course, presence: true
  validates :user, presence: true
  validate :validate_no_duplicate_pending_request, on: :create
  validates :workflow_state, length: { maximum: 255 }, presence: true

  before_destroy :validate_before_destroy

  belongs_to :course, inverse_of: :enrol_requests
  belongs_to :user, inverse_of: :course_enrol_requests
  belongs_to :confirmer, class_name: 'User', inverse_of: nil, optional: true

  alias_method :approve=, :approve!
  alias_method :reject=, :reject!

  scope :pending, -> { where(workflow_state: :pending) }

  private

  # Ensure that there are no enrol requests by users in the course.
  def validate_user_not_in_course
    errors.add(:base, :user_in_course) unless course.course_users.where(user: user).blank?
  end

  def validate_no_duplicate_pending_request
    existing_request = Course::EnrolRequest.find_by(course_id: course_id, user_id: user_id, workflow_state: 'pending')
    errors.add(:base, :existing_pending_request) if existing_request
  end

  def validate_before_destroy
    return true if workflow_state == 'pending'

    errors.add(:base, :deletion)
    throw(:abort)
  end

  def approve(_ = nil)
    self.confirmed_at = Time.zone.now
    self.confirmer = User.stamper
  end

  def reject(_ = nil)
    self.confirmed_at = Time.zone.now
    self.confirmer = User.stamper
  end
end
