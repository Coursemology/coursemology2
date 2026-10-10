# frozen_string_literal: true
# DEPRECATED (v1). This table (course_assessment_question_rubric_based_response_categories) is no longer in use.
# This table contained the categories for the v1 rubric-based response grading rubrics.
# DO NOT add new reads/writes - use Course::Rubric::Category. The model remains so that destroying a question
# also removes its v1 rows (and the v1 rows that reference them), and for the deprecated
# Course::Rubric.build_from_v1 safety net (the scope and ordering below; remove them with it).
class Course::Assessment::Question::RubricBasedResponseCategory < ApplicationRecord
  belongs_to :question,
             class_name: 'Course::Assessment::Question::RubricBasedResponse',
             inverse_of: :categories

  has_many :criterions, class_name: 'Course::Assessment::Question::RubricBasedResponseCriterion',
                        dependent: :destroy, foreign_key: :category_id, inverse_of: :category
  has_many :selections, class_name: 'Course::Assessment::Answer::RubricBasedResponseSelection',
                        dependent: :destroy, foreign_key: :category_id, inverse_of: :category

  default_scope { order(Arel.sql('is_bonus_category ASC'), name: :asc) }

  scope :without_bonus_category, -> { where(is_bonus_category: false) }
end
