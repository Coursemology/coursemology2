# frozen_string_literal: true
#
# For (GCE A-Level General Paper) comprehension questions, grades are mainly
# awarded by the number of correct points, TextResponseComprehensionPoint.
# There is an intermediary model, TextResponseComprehensionGroup, which stores
# the points.
#
# TextResponse
# ├── TextResponseSolution (no change)
# └── TextResponseComprehensionGroup *
#     └── TextResponseComprehensionPoint *
#         └── TextResponseComprehensionSolution *
#
# * table name prefix: `course_assessment_question_text_response_compre_`
#
# A question may have multiple groups of points.
# The +maximum_group_grade+ in each group caps the maximum possible grade for that group.
#
# For example, given points W, X, Y and Z, each point worth 1 mark, and
# the +maximum_grade+ of the question is 2 marks.
# If the answer scheme requires at least one point from (W or X) to score one mark,
# _and_ at least one point from (Y or Z) to score another one mark,
# then there must be TWO groups created.
# For the first group, the +points+ will be [W, X], +maximum_group_grade+ will be 1.
# For the second group, the +points+ will be [X, Y], +maximum_group_grade+ will be 1.
#
# For each point, there are keywords and lifted words (words that must not be used
# -- if used, the point will instantly score ZERO), collectively known as
# TextResponseComprehensionSolution.
#
# All lifted words for a point should be stored in ONE Solution, with the
# +solution_type+ as :compre_lifted_word, and all the lifted words in the +solution+ string array.
# +solution+ string array.
#
# The keywords for a point should be stored in one _or more_ Solutions, with the
# +solution_type+ as :compre_keyword, and the keywords in the +solution+ string array.
#
# The +solution_lemma+ string array stores the lemma form of each word in the
# +solution+ string array, which will be generated automatically whenever the question
# is saved.
# Instructors will only see the words in +solution+ in their view.
#
# For example, given keywords A, B, C, D and E, of which a point can only score
# if it has at least one keyword from (A, B or C), _and_ at least one keyword from (D or E),
# then there must be TWO solutions created.
# For the first solution, the +solution+ will be [A, B, C].
# For the second solution, the +solution+ will be [D, E].

class Course::Assessment::Question::TextResponseComprehensionGroup < ApplicationRecord
  self.table_name = 'course_assessment_question_text_response_compre_groups'

  validate :validate_group_grade

  has_many :points, class_name: Course::Assessment::Question::TextResponseComprehensionPoint.name,
                    dependent: :destroy, foreign_key: :group_id, inverse_of: :group

  belongs_to :question, class_name: Course::Assessment::Question::TextResponse.name,
                        inverse_of: :groups

  accepts_nested_attributes_for :points, allow_destroy: true

  def auto_gradable_group?
    points.any?(&:auto_gradable_point?)
  end

  def initialize_duplicate(duplicator, other)
    self.question = duplicator.duplicate(other.question)
    self.points = duplicator.duplicate(other.points)
  end

  private

  def validate_group_grade
    errors.add(:maximum_group_grade, :invalid_group_grade) if maximum_group_grade > question.maximum_grade
  end
end
