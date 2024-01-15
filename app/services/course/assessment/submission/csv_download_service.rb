# frozen_string_literal: true
require 'csv'
class Course::Assessment::Submission::CsvDownloadService
  class << self
    # Downloads the submissions in csv format
    #
    # @param [CourseUser] current_course_user The course user downloading the submissions.
    # @param [Course::Assessment] assessment The assessments to download submissions from.
    # @param [String|nil] course_users_type The subset of course users whose submissions to download.
    # Accepted values: 'my_students', 'my_students_w_phantom', 'students', 'students_w_phantom'
    #   'staff', 'staff_w_phantom'
    # @return [String] The path to the csv file.
    def download(current_course_user, assessment, course_users_type)
      service = new(current_course_user, assessment, course_users_type)
      ActsAsTenant.without_tenant do
        service.generate_csv
      end
    end
  end

  def generate_csv
    submissions = @assessment.submissions.by_users(course_users.pluck(:user_id)).
                  includes(:assessment, { answers: { actable: [:options, :files] },
                                          experience_points_record: :course_user })
    submissions_hash = submissions.to_h { |submission| [submission.creator_id, submission] }
    csv_file_path = File.join(@base_dir, "#{Pathname.normalize_filename(@assessment.title)}.csv")
    CSV.open(csv_file_path, 'w') do |csv|
      submissions_csv_header csv
      @course_users.each do |course_user|
        submissions_csv_row csv, submissions_hash[course_user.user_id], course_user
      end
    end
    csv_file_path
  end

  COURSE_USERS = { my_students: 'my_students',
                   my_students_w_phantom: 'my_students_w_phantom',
                   students: 'students',
                   students_w_phantom: 'students_w_phantom',
                   staff: 'staff',
                   staff_w_phantom: 'staff_w_phantom' }.freeze

  private

  def initialize(current_course_user, assessment, course_users_type)
    @current_course_user = current_course_user
    @course_users_type = course_users_type
    @assessment = assessment

    @question_assessments = Course::QuestionAssessment.where(assessment_id: assessment.id).
                            includes(:question)
    @sorted_question_ids = @question_assessments.pluck(:question_id)
    @questions = Course::Assessment::Question.where(id: @sorted_question_ids).
                 includes(:actable)
    @questions_downloadable = @questions.to_h { |q| [q.id, q.csv_downloadable?] }

    @base_dir = Dir.mktmpdir('coursemology-download-')
  end

  def submissions_csv_header(csv)
    # Question Title
    question_title = [I18n.t('course.assessment.submission.submissions.csv_download_service.note'), '', '', '',
                      I18n.t('course.assessment.submission.submissions.csv_download_service.question_title'),
                      *@question_assessments.map(&:display_title)]
    # Remove note if there is no N/A answer
    question_title[0] = '' if @questions_downloadable.values.all?
    csv << question_title

    # Question Type
    csv << ['', '', '', '',
            I18n.t('course.assessment.submission.submissions.csv_download_service.question_type'),
            *@question_assessments.map { |x| x.question.question_type_readable }]

    # Column Header
    csv << [I18n.t('course.assessment.submission.submissions.csv_download_service.name'),
            I18n.t('course.assessment.submission.submissions.csv_download_service.email'),
            I18n.t('course.assessment.submission.submissions.csv_download_service.role'),
            I18n.t('course.assessment.submission.submissions.csv_download_service.user_type'),
            I18n.t('course.assessment.submission.submissions.csv_download_service.status')]
  end

  def submissions_csv_row(csv, submission, course_user) # rubocop:disable Metrics/AbcSize
    row_array = [course_user.name,
                 course_user.user.email,
                 course_user.role,
                 if course_user.phantom?
                   I18n.t('course.assessment.submission.submissions.csv_download_service.phantom')
                 else
                   I18n.t('course.assessment.submission.submissions.csv_download_service.normal')
                 end]

    if submission
      current_answers_hash = submission.current_answers.to_h { |answer| [answer.question_id, answer] }
      answer_row = @questions.map do |question|
        answer = current_answers_hash[question.id]
        generate_answer_row(question, answer)
      end
      row_array.concat([submission.workflow_state, *answer_row])
    else
      row_array.append(I18n.t('course.assessment.submission.submissions.csv_download_service.unstarted'))
    end

    csv << row_array
  end

  def generate_answer_row(question, answer)
    return 'N/A' unless @questions_downloadable[question.id]
    return I18n.t('course.assessment.submission.submissions.csv_download_service.no_answer') if answer.nil?

    answer.specific.csv_download
  end

  def course_users # rubocop:disable Metrics/AbcSize
    @course_users ||=
      case @course_users_type
      when COURSE_USERS[:my_students]
        @current_course_user.my_students.without_phantom_users
      when COURSE_USERS[:my_students_w_phantom]
        @current_course_user.my_students
      when COURSE_USERS[:students_w_phantom]
        @assessment.course.course_users.students
      when COURSE_USERS[:staff]
        @assessment.course.course_users.staff.without_phantom_users
      when COURSE_USERS[:staff_w_phantom]
        @assessment.course.course_users.staff
      else
        @assessment.course.course_users.students.without_phantom_users
      end.order_phantom_user.order_alphabetically.includes(user: :emails)
  end
end
