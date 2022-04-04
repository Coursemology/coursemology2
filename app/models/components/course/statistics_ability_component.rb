# frozen_string_literal: true
module Course::StatisticsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    allow_staff_read_statistics if course_user&.staff?
    allow_staff_read_assessment_statistics if course_user&.staff?
    super
  end

  private

  def allow_staff_read_statistics
    can :read_statistics, Course, id: course.id
  end

  # This ability allows a user to view assessment statistics from all courses that they were a staff
  # of before. i.e. it's not restricted to the current course.
  def allow_staff_read_assessment_statistics
    can :read_ancestor, Course::Assessment, Course::Assessment.joins(tab: :category) do |a|
      other_course_user = CourseUser.find_by(course_id: a.tab.category.course_id, user_id: user.id)
      other_course_user&.staff?
    end
  end
end
