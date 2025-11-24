# frozen_string_literal: true
class Course::Assessment::Submission::ZipDownloadService < Course::Assessment::Submission::BaseZipDownloadService
  COURSE_USERS = { my_students: 'my_students',
                   my_students_w_phantom: 'my_students_w_phantom',
                   students: 'students',
                   students_w_phantom: 'students_w_phantom',
                   staff: 'staff',
                   staff_w_phantom: 'staff_w_phantom' }.freeze

  # @param [CourseUser] course_user The course user downloading the submissions.
  # @param [Course::Assessment] assessment The assessments to download submissions from.
  # @param [String|nil] course_users The subset of course users whose submissions to download.
  # Accepted values: 'my_students', 'my_students_w_phantom', 'students', 'students_w_phantom'
  #   'staff', 'staff_w_phantom'
  def initialize(course_user, assessment, course_users)
    super()
    @course_user = course_user
    @assessment = assessment
    @questions = assessment.questions.to_h { |q| [q.id, q] }
    @course_users = course_users
  end

  private

  # Downloads each submission to its own folder in the base directory.
  def download_to_base_dir
    submissions = @assessment.submissions.by_users(course_user_ids).
                  includes(:answers, experience_points_record: :course_user)
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

  def course_user_ids # rubocop:disable Metrics/AbcSize
    @course_user_ids ||=
      case @course_users
      when COURSE_USERS[:my_students]
        @course_user.my_students.without_phantom_users
      when COURSE_USERS[:my_students_w_phantom]
        @course_user.my_students
      when COURSE_USERS[:students_w_phantom]
        @assessment.course.course_users.students
      when COURSE_USERS[:staff]
        @assessment.course.course_users.staff.without_phantom_users
      when COURSE_USERS[:staff_w_phantom]
        @assessment.course.course_users.staff
      else
        @assessment.course.course_users.students.without_phantom_users
      end.select(:user_id)
  end
end
