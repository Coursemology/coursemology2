# frozen_string_literal: true

# Preloads SkillBranches, Skills and calculates student mastery
class Course::SkillsMasteryPreloadService
  # Preloads skills and calculate course user's mastery of the skills in the course.
  #
  # @param [Course] course The course to find Skills for.
  # @param [CourseUser] course_user The course user to calculate Skill mastery for.
  def initialize(course, course_user)
    @course = course
    @course_user = course_user
  end

  # @return [Array<Course::Assessment::SkillBranch>] Array of skill branches sorted by title.
  def skill_branches
    @skill_branches ||= @course.assessment_skill_branches.ordered_by_title
  end

  # Returns the skills which belong to a given skill branch.
  #
  # @param [Course::Assessment::SkillBranch] skill_branch The skill branch to get skills for
  # @return [Array<Course::Assessment::Skill>] Array of skills.
  def skills_in_branch(skill_branch)
    skills_by_branch[skill_branch]
  end

  # Calculate the percentage of points in the skill which the course user has obtained.
  #
  # @param [Course::Assessment::Skill] skill The skill to calculate percentage mastery for.
  # @return [Integer] Percentage of skill mastered, rounded off
  def percentage_mastery(skill)
    skill_total_grade = skill.total_grade
    return 0 unless skill_total_grade > 0

    (grade(skill) / skill_total_grade.to_f * 100).round
  end

  # Returns the total grade obtained for a given skill.
  #
  # @param [Course::Assessment::Skill] skill The skill to get the grade for.
  # @return [Float]
  def grade(skill)
    grade_by_skill[skill]
  end

  private

  # @param [Course] course The course to find Skills for.
  def skills_by_branch
    @skills_by_branch ||= @course.assessment_skills.includes(:skill_branch).order_by_title.
                          group_by(&:skill_branch)
  end

  def grade_by_skill
    @grade_by_skill ||= begin
      grade_by_skill = Hash.new(0)
      submission_ids = Course::Assessment::Submission.by_user(@course_user.user.id).
                       from_course(@course).with_published_state.pluck(:id)
      answers = Course::Assessment::Answer.belonging_to_submissions(submission_ids).current_answers.
                includes(question: { question_assessments: :skills })
      answers.each do |answer|
        answer.question.question_assessments.each do |question_assessment|
          question_assessment.skills.each do |skill|
            grade_by_skill[skill] += answer.grade
          end
        end
      end
      grade_by_skill
    end
  end
end
