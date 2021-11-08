# frozen_string_literal: true
class Course::AssessmentNotifier < Notifier::Base
  # To be called when user attempted an assessment.
  def assessment_attempted(user, assessment)
    create_activity(actor: user, object: assessment, event: :attempted).
      notify(assessment.tab.category.course, :feed).
      save!
  end

  # To be called when user submitted an assessment.
  def assessment_submitted(user, course_user, submission)
    email_enabled = submission.assessment.
                    course.email_enabled(:assessments, :new_submission, submission.assessment.tab.category.id)
    return unless email_enabled.regular || email_enabled.phantom

    # TODO: Replace with a group_manager method in course_user
    managers = course_user.groups.includes(group_users: [course_user: [:user]]).
               flat_map { |g| g.group_users.select(&:manager?) }.map(&:course_user)

    # Default to course manager if the course user do not have any group manager
    managers = course_user.course.managers.includes(:user) unless managers.count > 0

    # Get all managers who unsubscribed
    unsubscribed = course_user.course.managers.includes(:user).
                   joins(:email_unsubscriptions).
                   where('course_user_email_unsubscriptions.course_settings_email_id = ?', email_enabled.id)
    managers = Set.new(managers) - Set.new(unsubscribed)

    activity = create_activity(actor: user, object: submission, event: :submitted)
    managers.each do |manager|
      is_disabled_as_phantom = manager.phantom? && !email_enabled.phantom
      is_disabled_as_regular = !manager.phantom? && !email_enabled.regular
      next if is_disabled_as_phantom || is_disabled_as_regular

      activity.notify(manager.user, :email)
    end
    activity.save!
  end
end
