# frozen_string_literal: true
class Course::Assessment::Answer::RubricAutoGradingService < Course::Assessment::Answer::AutoGradingService # rubocop:disable Metrics/ClassLength
  def evaluate(answer)
    answer.correct, grade, messages, feedback = evaluate_answer(answer.actable)
    answer.auto_grading.result = { messages: messages }
    create_ai_generated_draft_post(answer, feedback)
    grade
  end

  private

  # Grades the given answer.
  #
  # @param [Course::Assessment::Answer::RubricBasedResponse] answer The answer specified.
  # @return [Array<(Boolean, Integer, Object, String)>] The correct status, grade, messages to be
  #   assigned to the grading, and feedback for the draft post.
  def evaluate_answer(answer)
    question = answer.question.actable
    llm_service = Course::Assessment::Answer::RubricLlmService.new
    llm_response = llm_service.evaluate(question, answer)
    process_llm_grading_response(answer, llm_response)
  end

  # Processes the LLM response into grades and feedback, and updates the answer.
  # @param [Course::Assessment::Answer::RubricBasedResponse] answer The answer to update.
  # @param [Hash] llm_response The parsed LLM response containing grading information
  # @return [Array<(Boolean, Integer, Object, String)>] The correct status, grade, and feedback messages.
  def process_llm_grading_response(answer, llm_response)
    category_grades = llm_response['category_grades']

    # For rubric-based questions, update the answer's selections and grade to database
    update_answer_selections(answer, category_grades)
    grade = update_answer_grade(answer, category_grades)

    # Currently no support for correctness in rubric-based questions
    [true, grade, ['success'], llm_response['feedback']]
  end

  # Updates the answer's selections and total grade based on the graded categories.
  #
  # @param [Course::Assessment::Answer::RubricBasedResponse] answer The answer to update.
  # @param [Array<Hash>] category_grades The processed category grades.
  # @return [void]
  def update_answer_selections(answer, category_grades)
    if answer.selections.empty?
      answer.create_category_grade_instances
      answer.reload
    end
    selection_lookup = answer.selections.index_by(&:category_id)
    params = {
      selections_attributes: category_grades.map do |grade_info|
        selection = selection_lookup[grade_info[:category_id]]
        next unless selection

        {
          id: selection.id,
          criterion_id: grade_info[:criterion_id],
          grade: grade_info[:grade],
          explanation: grade_info[:explanation]
        }
      end.compact
    }
    answer.assign_params(params)
  end

  # Updates the answer's total grade based on the graded categories.
  # @param [Course::Assessment::Answer::RubricBasedResponse] answer The answer to update.
  # @param [Array<Hash>] category_grades The processed category grades.
  # @return [Integer] The new total grade for the answer.
  def update_answer_grade(answer, category_grades)
    grade_lookup = category_grades.to_h { |info| [info[:category_id], info[:grade]] }
    total_grade = answer.selections.includes(:criterion).sum do |selection|
      grade_lookup[selection.category_id] || selection.criterion&.grade || selection.grade || 0
    end
    total_grade = total_grade.clamp(0, answer.question.maximum_grade)
    answer.grade = total_grade
    total_grade
  end

  # Builds a draft post with AI-generated feedback
  # @param [Course::Assessment::SubmissionQuestion] submission_question The submission question
  # @param [Course::Assessment::Answer] answer The answer
  # @param [String] feedback The feedback text
  # @return [Course::Discussion::Post] The built post
  def build_draft_post(submission_question, answer, feedback)
    submission_question.posts.build(
      creator: User.system,
      updater: User.system,
      text: feedback,
      is_ai_generated: true,
      workflow_state: 'draft',
      title: answer.submission.assessment.title
    )
  end

  # Saves the draft post and updates the submission question
  # @param [Course::Assessment::SubmissionQuestion] submission_question The submission question
  # @param [Course::Discussion::Answer] answer The answer to associate with the post
  # @param [Course::Discussion::Post] post The post to save
  # @return [void]
  def save_draft_post(submission_question, answer, post)
    submission_question.class.transaction do
      if submission_question.posts.length > 1
        post.parent = submission_question.posts.ordered_topologically.flatten.select(&:id).last
      end
      post.save!
      submission_question.save!
      create_topic_subscription(post.topic, answer)
      post.topic.mark_as_pending
    end
  end

  # Updates an existing AI-generated draft post with new feedback
  # @param [Course::Discussion::Post] post The existing post to update
  # @param [Course::Assessment::Answer] answer The answer
  # @param [String] feedback The new feedback text
  # @return [void]
  def update_existing_draft_post(post, answer, feedback)
    post.class.transaction do
      post.update!(
        text: feedback,
        updater: User.system,
        title: answer.submission.assessment.title
      )
      post.topic.mark_as_pending
    end
  end

  # Creates a subscription for the discussion topic of the answer post
  # @param [Course::Assessment::Answer] answer The answer to create the subscription for
  # @param [Course::Discussion::Topic] discussion_topic The discussion topic to subscribe to
  # @return [void]
  def create_topic_subscription(discussion_topic, answer)
    # Ensure the student who wrote the answer amd all group managers
    # gets notified when someone comments on his answer
    discussion_topic.ensure_subscribed_by(answer.submission.creator)
    answer_course_user = answer.submission.course_user
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

  # Creates or updates AI-generated draft feedback post for the answer
  # @param [Course::Assessment::Answer] answer The answer to create/update the post for
  # @param [String] feedback The feedback text to include in the post
  # @return [void]
  def create_ai_generated_draft_post(answer, feedback)
    submission_question = answer.submission.submission_questions.find_by(question_id: answer.question_id)
    return unless submission_question

    existing_post = find_existing_ai_draft_post(submission_question)

    if existing_post
      update_existing_draft_post(existing_post, answer, feedback)
    else
      post = build_draft_post(submission_question, answer, feedback)
      save_draft_post(submission_question, answer, post)
    end
  end
end
