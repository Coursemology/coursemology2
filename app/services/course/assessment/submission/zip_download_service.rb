# frozen_string_literal: true
class Course::Assessment::Submission::ZipDownloadService < Course::Assessment::Submission::BaseZipDownloadService
  # @param [CourseUser|nil] current_course_user The course user downloading the submissions.
  # @param [Course::Assessment] assessment The assessments to download submissions from.
  # @param [String|nil] course_user_type The subset of course users whose submissions to download.
  # Accepted values: 'my_students', 'my_students_w_phantom', 'students', 'students_w_phantom'
  #   'staff', 'staff_w_phantom'
  def initialize(current_course_user, assessment, course_user_type)
    super()
    @current_course_user = current_course_user
    @assessment = assessment
    @questions = assessment.questions.to_h { |q| [q.id, q] }
    @course_user_type = course_user_type
  end

  private

  # Downloads each submission to its own folder in the base directory.
  def download_to_base_dir
    submissions = @assessment.submissions.by_users(course_user_ids).
                  includes({ attempt: :answers }, experience_points_record: :course_user)
    submissions.find_each do |submission|
      submission_dir = create_folder(@base_dir, submission.course_user.name)
      download_answers(submission, submission_dir)
    end
  end

  # Downloads each answer to its own folder in the submission directory.
  def download_answers(submission, submission_dir)
    answers = submission.answers.includes(:question).latest_answers.
              select { |answer| @questions[answer.question_id]&.files_downloadable? }
    answers.each do |answer|
      question_assessment = submission.assessment.question_assessments.
                            find_by!(question: @questions[answer.question_id])
      answer_dir = create_folder(submission_dir, question_assessment.display_title)
      answer.specific.download(answer_dir)
    end
  end

  def course_user_ids
    source_course = @current_course_user&.course || @assessment.course
    @course_user_ids ||= source_course.course_users_by_type(@course_user_type, @current_course_user).select(:user_id)
  end
end
