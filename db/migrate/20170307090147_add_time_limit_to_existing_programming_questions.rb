class AddTimeLimitToExistingProgrammingQuestions < ActiveRecord::Migration
  def change
    add_lower_default_to_existing_programming_questions
  end

  def add_lower_default_to_existing_programming_questions
    Course::Assessment::Question::Programming.where(time_limit: nil).update_all(time_limit: 10)
  end
end
