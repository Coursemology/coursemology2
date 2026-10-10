# frozen_string_literal: true
# DEPRECATED (v1). This table (course_assessment_question_rubric_based_response_criterions) is no longer in use.
# This table contained the criteria for the v1 rubric-based response grading rubrics under the categories.
# DO NOT add new reads/writes - use Course::Rubric::Category::Criterion. The model remains only so that
# destroying a question also removes its v1 rows (and the v1 rows that reference them).
class Course::Assessment::Question::RubricBasedResponseCriterion < ApplicationRecord
  belongs_to :category,
             class_name: 'Course::Assessment::Question::RubricBasedResponseCategory',
             inverse_of: :criterions

  has_many :selections,
           class_name: 'Course::Assessment::Answer::RubricBasedResponseSelection',
           foreign_key: :criterion_id, inverse_of: :criterion, dependent: :nullify
end
