# frozen_string_literal: true
class Course::Assessment::Answer::CommentNotifier < Notifier::Base
  # To be called when user adds a post to a programming annotation.
  def annotation_replied(user, post)
    return unless email_enabled?(post)

    activity = create_activity(actor: user, object: post, event: :annotated)
    post.topic.subscriptions.includes(:user).each do |subscription|
      activity.notify(subscription.user, :email) unless subscription.user == user
    end
    activity.save!
  end

  private

  def email_enabled?(post)
    category = post.topic.actable.file.answer.submission.assessment.tab.category
    Course::Settings::AssessmentsComponent.email_enabled?(category, :new_comment)
  end
end
