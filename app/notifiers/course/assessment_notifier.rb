class Course::AssessmentNotifier < Notifier::Base
  # To be called when user attempted an assessment.
  def assessment_attempted(user, assessment)
    create_activity(actor: user, object: assessment, event: :attempted).
      notify(assessment.tab.category.course, :feed).
      save!
  end

  # To be called when user submitted an assessment.
  def assessment_submitted(user, course_user, submission)
    return unless email_enabled?(submission.assessment, :new_submission)

    # TODO: Replace with a group_manager method in course_user
    managers = course_user.groups.includes(group_users: [course_user: [:user]]).
               flat_map { |g| g.group_users.select(&:manager?) }.map(&:course_user)

    # Default to course manager if the course user do not have any group manager
    managers = course_user.course.managers.includes(:user) unless managers.count > 0

    activity = create_activity(actor: user, object: submission, event: :submitted)
    managers.each { |manager| activity.notify(manager.user, :email) }
    activity.save!
  end

  private

  def email_enabled?(assessment, key)
    Course::Settings::AssessmentsComponent.email_enabled?(assessment.tab.category, key)
  end
end
