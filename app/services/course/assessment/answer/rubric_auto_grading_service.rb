# frozen_string_literal: true
class Course::Assessment::Answer::RubricAutoGradingService <
  Course::Assessment::Answer::AutoGradingService
  def evaluate(answer, auto_grading)
    answer.correct, grade, messages, feedback = evaluate_answer(answer.actable)
    auto_grading.result = { messages: messages }
    create_ai_generated_draft_post(answer, feedback)
    grade
  end

  private

  # Grades the given answer.
  #
  # @param [Course::Assessment::Answer::RubricBasedResponse] answer The answer specified by the
  # @return [Array<(Boolean, Integer, Object, String)>] The correct status, grade, messages to be
  #   assigned to the grading, and feedback for the draft post.
  def evaluate_answer(answer)
    question = answer.question.actable
    llm_service = Course::Assessment::Answer::RubricLlmService.new
    llm_response = llm_service.evaluate(question, answer)
    process_llm_grading_response(question, answer, llm_response)
  end

  # Processes the LLM response into grades and feedback, and updates the answer.
  # @param [Course::Assessment::Question::RubricBasedResponse] question The question to be graded.
  # @param [Course::Assessment::Answer::RubricBasedResponse] answer The answer to update.
  # @param [Hash] llm_response The parsed LLM response containing grading information
  # @return [Array<(Boolean, Integer, Object, String)>] The correct status, grade, and feedback messages.
  def process_llm_grading_response(question, answer, llm_response)
    category_grades = process_category_grades(question, llm_response)

    # For rubric-based questions, update the answer's selections and grade to database
    update_answer_selections(answer, category_grades)
    grade = update_answer_grade(answer, category_grades)

    # Currently no support for correctness in rubric-based questions
    [true, grade, ['success'], llm_response['overall_feedback']]
  end

  # Processes category grades from LLM response into a structured format
  # @param [Course::Assessment::Question::RubricBasedResponse] question The question to be graded.
  # @param [Hash] llm_response The parsed LLM response with category grades
  # @return [Array<Hash>] Array of processed category grades.
  def process_category_grades(question, llm_response)
    category_lookup = question.categories.without_bonus_category.includes(:criterions).index_by(&:id)
    llm_response['category_grades'].filter_map do |category_grade|
      category = category_lookup[category_grade['category_id']]
      next unless category

      criterion = category.criterions.find { |c| c.id == category_grade['criterion_id'] }
      next unless criterion

      {
        category_id: category_grade['category_id'],
        criterion_id: criterion&.id,
        grade: criterion&.grade,
        explanation: category_grade['explanation']
      }
    end
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

  # Creates AI-generated draft feedback post for the answer
  # @param [Course::Assessment::Answer] answer The answer to create the post for
  # @param [String] feedback The feedback text to include in the post
  # @return [void]
  def create_ai_generated_draft_post(answer, feedback)
    submission_question = answer.submission.submission_questions.find_by(question_id: answer.question_id)
    return unless submission_question

    post = build_draft_post(submission_question, answer, feedback)
    save_draft_post(submission_question, answer, post)
  end
end
