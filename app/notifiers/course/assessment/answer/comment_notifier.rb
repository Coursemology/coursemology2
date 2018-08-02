# frozen_string_literal: true
class Course::Assessment::Answer::CommentNotifier < Notifier::Base
  # Called when a user adds a post to a programming annotation.
  #
  # @param[Course::Discussion::Post] post The post that was created.
  def annotation_replied(post)
    return unless email_notification_enabled?(post)

    activity = create_activity(actor: post.creator, object: post, event: :annotated)

    post.topic.subscriptions.includes(:user).each do |subscription|
      activity.notify(subscription.user, :email) unless subscription.user == post.creator
    end
    activity.save!
  end

  private

  def email_notification_enabled?(post)
    course_user = CourseUser.find_by(user: post.creator, course: post.topic.course)
    category = post.topic.actable.file.answer.submission.assessment.tab.category

    response = settings_with_key(category, :new_comment)
    response &&= settings_with_key(category, :new_phantom_comment) if course_user&.phantom?
    response
  end

  def settings_with_key(category, key)
    Course::Settings::AssessmentsComponent.email_enabled?(category, key)
  end
end
