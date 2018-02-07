# frozen_string_literal: true
module Course::Assessment::Answer::ProgrammingAbility
  def define_permissions
    if user
      allow_students_create_programming_files
      allow_students_destroy_programming_files
    end

    super
  end

  def allow_students_create_programming_files
    can :create_programming_files, Course::Assessment::Answer::Programming do |programming_answer|
      multiple_file_submission?(programming_answer.question) &&
        creator?(programming_answer.submission) &&
        can_update_submission?(programming_answer.submission) &&
        current_answer?(programming_answer)
    end
  end

  def allow_students_destroy_programming_files
    can :destroy_programming_file, Course::Assessment::Answer::Programming do |programming_answer|
      multiple_file_submission?(programming_answer.question) &&
        creator?(programming_answer.submission) &&
        can_update_submission?(programming_answer.submission) &&
        current_answer?(programming_answer)
    end
  end

  # Checks if the question that the answer belongs to is a file_submission question
  def multiple_file_submission?(question)
    question.specific.multiple_file_submission
  end

  def can_update_submission?(submission)
    can? :update, submission
  end

  def creator?(submission)
    submission.creator_id == user.id
  end

  def current_answer?(programming_answer)
    programming_answer.answer.current_answer?
  end
end
