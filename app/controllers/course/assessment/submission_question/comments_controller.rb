# frozen_string_literal: true
class Course::Assessment::SubmissionQuestion::CommentsController < Course::Assessment::Controller
  helper Course::Assessment::Submission::SubmissionsHelper.name.sub(/Helper$/, '')

  # PostsConcern MUST be included after loading subimssion_question
  load_and_authorize_resource :submission_question,
                              class: Course::Assessment::SubmissionQuestion.name
  include Course::Discussion::PostsConcern

  delegate :discussion_topic, to: :@submission_question

  def create
    @submission_question.class.transaction do
      @post.title = @assessment.title
      # Set parent as the topologically last pre-existing post, if it exists.
      @post.parent = last_post_from(@submission_question) if @submission_question.posts.length > 1
      if super && @submission_question.save
        send_created_notification(@post)
        render_create_response
      else
        head :bad_request
      end
    end
  end

  private

  def create_topic_subscription
    @discussion_topic.ensure_subscribed_by(current_user)
    # Ensure submission's creator gets a notification when someone comments on this
    # submission question.
    @discussion_topic.ensure_subscribed_by(@submission_question.submission.creator)

    # Ensure all group managers get a notification when someone comments on this submission question
    submission_question_course_user = @submission_question.submission.course_user
    submission_question_course_user.my_managers.each do |manager|
      @discussion_topic.ensure_subscribed_by(manager.user)
    end
  end

  def send_created_notification(post)
    post.topic.actable.notify(post) if current_course_user && !current_course_user.phantom?
  end

  def last_post_from(submission_question)
    # @post is in submission_question.posts, so we filter out @post, which has no id yet.
    submission_question.posts.ordered_topologically.flatten.select(&:id).last
  end

  def render_create_response
    respond_to do |format|
      format.js
      format.json { render partial: @post }
    end
  end
end
