# frozen_string_literal: true

class Course::Assessment::Answer::AiGeneratedPostService
  # How a course delivers generated rubric feedback to its students (Course#rubric_grading_feedback_workflow,
  # configured under Course Settings > Assessments). Mirrors the Codaveri component's feedback_workflow, with
  # the publish case split in two: rubric answers are graded both when a student submits a single answer and
  # when they finalise the submission.
  #
  #   * +none+                     -- grade the answer, but draft no feedback comment at all.
  #   * +draft+                    -- staff accept or reject the comment before the student sees it (default).
  #   * +publish_on_answer_submit+ -- the student sees the comment as soon as the answer is graded.
  #   * +publish_on_finalise+      -- drafted while the submission is being attempted, published (see
  #                                   Course::Assessment::Submission#publish_ai_generated_feedback) once it
  #                                   is finalised.
  NO_FEEDBACK = 'none'
  DRAFT_FEEDBACK = 'draft'
  PUBLISH_ON_ANSWER_SUBMIT = 'publish_on_answer_submit'
  PUBLISH_ON_FINALISE = 'publish_on_finalise'
  FEEDBACK_WORKFLOWS = [NO_FEEDBACK, DRAFT_FEEDBACK, PUBLISH_ON_ANSWER_SUBMIT, PUBLISH_ON_FINALISE].freeze
  DEFAULT_FEEDBACK_WORKFLOW = DRAFT_FEEDBACK

  # @param [Course::Assessment::Answer] answer The answer to create/update the post for
  # @param [String] feedback The feedback text to include in the post
  # @param [Boolean] force_draft Whether to draft the comment regardless of the course's workflow. Set by
  #   staff-initiated generation (applying playground evaluations), which may publish to a whole class at
  #   once and so is never delivered to students without a person deciding to.
  def initialize(answer, content, force_draft: false)
    @answer = answer
    @content = content
    @force_draft = force_draft
  end

  # Creates or updates the AI-generated feedback post for the answer, drafted or published according to the
  # course's feedback workflow.
  # @return [void]
  def create_ai_generated_draft_post
    return if feedback_workflow == NO_FEEDBACK

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

  # @return [String] one of FEEDBACK_WORKFLOWS
  def feedback_workflow
    return DRAFT_FEEDBACK if @force_draft

    @feedback_workflow ||= @answer.submission.assessment.course.rubric_grading_feedback_workflow
  end

  # Whether this comment reaches the student without a staff decision. +publish_on_finalise+ waits: a
  # comment drafted mid-attempt stays a draft, and the submission publishes it when it is finalised, while
  # a comment generated after that point (finalising triggers grading of the remaining answers) is published
  # straight away.
  # @return [Boolean]
  def publish_immediately?
    case feedback_workflow
    when PUBLISH_ON_ANSWER_SUBMIT then true
    when PUBLISH_ON_FINALISE then !@answer.submission.attempting?
    else false
    end
  end

  # Builds a draft post with AI-generated feedback
  # @param [Course::Assessment::SubmissionQuestion] submission_question The submission question
  # @return [Course::Discussion::Post] The built post
  def build_draft_post(submission_question)
    submission_question.posts.build(
      creator: User.system,
      updater: User.system,
      text: @content,
      is_ai_generated: true,
      workflow_state: publish_immediately? ? 'published' : 'draft',
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
      # The rating is initialized whichever way the comment is delivered, so the generated text is always
      # snapshotted. A published comment carries no rating UI today (the card is draft-only), so its rating
      # stays unrated -- the same trade the Codaveri publish workflow makes.
      initialize_rating(post)
      create_topic_subscription(post.topic)
      post.topic.mark_as_pending unless post.published?
    end
  end

  # Updates an existing AI-generated draft post with new feedback
  # @param [Course::Discussion::Post] post The existing post to update
  # @param [Course::Assessment::Answer] answer The answer
  # @param [String] feedback The new feedback text
  # @return [void]
  def update_existing_draft_post(post)
    post.class.transaction do
      # Re-generation replaces the draft's content, so refresh created_at too -- graders see it as a newly
      # generated comment (fresh timestamp), and the changed timestamp lets the client remount the card with
      # the new content.
      post.update!(
        text: @content,
        updater: User.system,
        title: @answer.submission.assessment.title,
        created_at: Time.current
      )
      refresh_rating(post)
      post.topic.mark_as_pending
    end
  end

  # The answer's grade-bearing evaluation, whose feedback drives the draft post. Present whenever this service
  # runs (auto-grading and apply both mirror it before drafting the post); the rating links back to it.
  # @return [Course::Rubric::AnswerEvaluation, nil]
  def grading_evaluation
    @grading_evaluation ||= @answer.grading_rubric_evaluation
  end

  # Initializes an unrated rating record for a freshly created draft post, snapshotting the generated feedback.
  # @param [Course::Discussion::Post] post The draft post
  # @return [void]
  def initialize_rating(post)
    return unless grading_evaluation

    grading_evaluation.ratings.create!(
      post: post, original_feedback: @content, creator: User.system, updater: User.system
    )
  end

  # Reconciles the rating when a draft post's feedback is re-generated in place:
  #   * no rating yet          -> initialize one.
  #   * rating exists, unrated -> reuse it, refreshing the snapshotted feedback.
  #   * rating already scored  -> preserve it (detach from the post) and start a fresh one.
  # @param [Course::Discussion::Post] post The existing draft post
  # @return [void]
  def refresh_rating(post)
    rating = post.ai_feedback_rating
    return initialize_rating(post) if rating.nil?

    if rating.rating.nil?
      rating.update!(original_feedback: @content)
    else
      rating.update!(post: nil)
      initialize_rating(post)
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

  # Finds the latest AI-generated draft post for the submission question. Only drafts are updated in place,
  # so under a publish workflow a re-graded answer gains a new comment instead of having one the student may
  # already have read rewritten underneath them.
  # @param [Course::Assessment::SubmissionQuestion] submission_question The submission question
  # @return [Course::Discussion::Post, nil] The latest AI-generated draft post or nil if none exists
  def find_existing_ai_draft_post(submission_question)
    submission_question.posts.
      where(is_ai_generated: true, workflow_state: 'draft').
      last
  end
end
