# frozen_string_literal: true

class Course::Assessment::Answer::AiGeneratedPostService
  # @param [Course::Assessment::Answer] answer The answer to create/update the post for
  # @param [String] feedback The feedback text to include in the post
  def initialize(answer, content)
    @answer = answer
    @content = content
  end

  # Creates or updates AI-generated draft feedback post for the answer
  # @return [void]
  def create_ai_generated_draft_post
    submission_question = @answer.submission.submission_questions.find_by(question_id: @answer.question_id)
    return unless submission_question

    existing_post = find_existing_ai_draft_post(submission_question)

    if existing_post
      update_existing_draft_post(existing_post)
    else
      post = build_draft_post(submission_question)
      save_draft_post(submission_question, post)
    end
  end

  private

  # Builds a draft post with AI-generated feedback
  # @param [Course::Assessment::SubmissionQuestion] submission_question The submission question
  # @return [Course::Discussion::Post] The built post
  def build_draft_post(submission_question)
    submission_question.posts.build(
      creator: User.system,
      updater: User.system,
      text: @content,
      is_ai_generated: true,
      workflow_state: 'draft',
      title: @answer.submission.assessment.title
    )
  end

  # Saves the draft post and updates the submission question
  # @param [Course::Assessment::SubmissionQuestion] submission_question The submission question
  # @param [Course::Discussion::Post] post The post to save
  # @return [void]
  def save_draft_post(submission_question, post)
    submission_question.class.transaction do
      if submission_question.posts.length > 1
        post.parent = submission_question.posts.ordered_topologically.flatten.select(&:id).last
      end
      post.save!
      submission_question.save!
      create_topic_subscription(post.topic)
      post.topic.mark_as_pending
    end
  end

  # Updates an existing AI-generated draft post with new feedback
  # @param [Course::Discussion::Post] post The existing post to update
  # @param [Course::Assessment::Answer] answer The answer
  # @param [String] feedback The new feedback text
  # @return [void]
  def update_existing_draft_post(post)
    post.class.transaction do
      post.update!(
        text: @content,
        updater: User.system,
        title: @answer.submission.assessment.title
      )
      post.topic.mark_as_pending
    end
  end

  # Creates a subscription for the discussion topic of the answer post
  # @param [Course::Assessment::Answer] answer The answer to create the subscription for
  # @param [Course::Discussion::Topic] discussion_topic The discussion topic to subscribe to
  # @return [void]
  def create_topic_subscription(discussion_topic)
    # Ensure the student who wrote the answer amd all group managers
    # gets notified when someone comments on his answer
    discussion_topic.ensure_subscribed_by(@answer.submission.creator)
    answer_course_user = @answer.submission.course_user
    answer_course_user.my_managers.each do |manager|
      discussion_topic.ensure_subscribed_by(manager.user)
    end
  end

  # Finds the latest AI-generated draft post for the submission question
  # @param [Course::Assessment::SubmissionQuestion] submission_question The submission question
  # @return [Course::Discussion::Post, nil] The latest AI-generated draft post or nil if none exists
  def find_existing_ai_draft_post(submission_question)
    submission_question.posts.
      where(is_ai_generated: true, workflow_state: 'draft').
      last
  end
end
