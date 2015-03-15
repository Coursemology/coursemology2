class Course::EnrolRequest < ActiveRecord::Base
  stampable
  has_paper_trail on: [:destroy]
  validates_uniqueness_of :course_id, scope: :user_id

  scope :student, -> { where(role: CourseUser.roles[:student]) }
  scope :staff, -> { where(role: [CourseUser.roles[:teaching_assistant],
                                  CourseUser.roles[:manager],
                                  CourseUser.roles[:owner]]) }

  enum role: CourseUser.roles

  belongs_to :course
  belongs_to :user

  def approve!
    if !CourseUser.where(course_id: self.course_id, user_id: self.user_id).empty?
      return
    end

    self.course.course_users.create!(user_id: self.user_id,
                                     role: self.role,
                                     name: self.user.name)
  end

  # TODO add notify lecturer method
end
