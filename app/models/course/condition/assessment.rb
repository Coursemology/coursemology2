class Course::Condition::Assessment < ActiveRecord::Base
  include ActiveSupport::NumberHelper

  acts_as_condition
  belongs_to :assessment, class_name: Course::Assessment.name, inverse_of: false

  default_scope { includes(:assessment) }

  def title
    if minimum_grade_percentage
      minimum_grade_percentage_display = number_to_percentage(minimum_grade_percentage,
                                                              precision: 2,
                                                              strip_insignificant_zeros: true)
      self.class.human_attribute_name('title.title',
                                      assessment_title: assessment.title,
                                      minimum_grade_percentage: minimum_grade_percentage_display)
    else
      assessment.title
    end
  end

  def satisfied_by?(course_user)
    user = course_user.user

    if minimum_grade_percentage
      minimum_grade = assessment.maximum_grade * minimum_grade_percentage / 100.0
      graded_submissions_with_minimum_grade(user, minimum_grade).exists?
    else
      graded_submissions_by_user(user).exists?
    end
  end

  private

  def graded_submissions_by_user(user)
    assessment.submissions.by_user(user).with_graded_state
  end

  def graded_submissions_with_minimum_grade(user, minimum_grade)
    graded_submissions_by_user(user).joins { answers }.
      group { course_assessment_submissions.id }.
      having { sum(answers.grade) >= minimum_grade }
  end
end
