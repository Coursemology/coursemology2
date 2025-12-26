# frozen_string_literal: true
require 'csv'
class Course::Assessment::Submission::StatisticsDownloadService
  include TmpCleanupHelper
  include ApplicationFormattersHelper

  # @param [Course] current_course The current course the submissions belong to
  # @param [User] current_user The current user downloading the statistics.
  # @param [Array<Integer>] submission_ids The ids of the submissions to download statistics for
  def initialize(current_course, current_user, submission_ids)
    @current_user = current_user
    @submission_ids = submission_ids
    @current_course = current_course
    @base_dir = Dir.mktmpdir('coursemology-statistics-')
  end

  # Downloads the statistics and zip them.
  #
  # @return [String] The path to the csv file.
  def generate
    ActsAsTenant.without_tenant do
      generate_csv_report
    end
  end

  def generate_csv_report
    submissions = Course::Assessment::Submission.
                  where(id: @submission_ids).
                  calculated(:log_count, :graded_at, :grade, :grader_ids).
                  includes(:course_user, :publisher)
    assessment = submissions&.first&.assessment&.calculated(:maximum_grade)
    @course_users_hash ||= @current_course.course_users.to_h { |cu| [cu.user_id, cu] }
    @questions = assessment&.questions || []
    statistics_file_path = File.join(@base_dir, 'statistics.csv')
    CSV.open(statistics_file_path, 'w') do |csv|
      download_statistics_header csv
      submissions.each do |submission|
        download_statistics csv, submission, assessment
      end
    end
    statistics_file_path
  end

  private

  def cleanup_entries
    [@base_dir]
  end

  def download_statistics_header(csv)
    csv << [I18n.t('csv.assessment_statistics.headers.name'),
            I18n.t('csv.assessment_statistics.headers.phantom'),
            I18n.t('csv.assessment_statistics.headers.status'),
            I18n.t('csv.assessment_statistics.headers.start_date_time'),
            I18n.t('csv.assessment_statistics.headers.submitted_date_time'),
            I18n.t('csv.assessment_statistics.headers.time_taken'),
            I18n.t('csv.assessment_statistics.headers.graded_date_time'),
            I18n.t('csv.assessment_statistics.headers.grading_time'),
            I18n.t('csv.assessment_statistics.headers.grader'),
            I18n.t('csv.assessment_statistics.headers.publisher'),
            I18n.t('csv.assessment_statistics.headers.exp_points'),
            I18n.t('csv.assessment_statistics.headers.grade'),
            I18n.t('csv.assessment_statistics.headers.max_grade'),
            *csv_header_question_grade]
  end

  def csv_header_question_grade
    questions = @questions
    questions.each_with_index.map do |question, index|
      "Q#{index + 1} grade (Max grade: #{question.maximum_grade})"
    end
  end

  def download_statistics(csv, submission, assessment)
    course_user = @course_users_hash[submission.creator_id]
    csv << [course_user.name,
            course_user.phantom?,
            submission.workflow_state,
            csv_created_at(submission),
            csv_submitted_date_time(submission),
            csv_time_taken(submission),
            csv_graded_at(submission),
            csv_grading_time(submission),
            csv_grader(submission),
            csv_publisher(submission),
            csv_exp_points(submission),
            submission.grade.to_f,
            assessment.maximum_grade,
            *csv_question_grade(submission)]
  end

  def csv_empty
    I18n.t('csv.assessment_statistics.values.empty')
  end

  def csv_time_taken(submission)
    if submission.submitted_at && submission.created_at
      format_duration submission.submitted_at.to_time.to_i - submission.created_at.to_time.to_i
    else
      csv_empty
    end
  end

  def csv_question_grade(submission)
    question_ids = @questions.map(&:id)
    question_ids&.map do |qn_id|
      answer = submission.answers.from_question(qn_id).find(&:current_answer?)
      answer ? answer.grade.to_s : '-'
    end
  end

  def csv_exp_points(submission)
    submission.current_points_awarded || csv_empty
  end

  def csv_created_at(submission)
    if submission.created_at
      format_datetime(submission.created_at, :long, user: @current_user)
    else
      csv_empty
    end
  end

  def csv_submitted_date_time(submission)
    if submission.submitted_at
      format_datetime(submission.submitted_at, :long, user: @current_user)
    else
      csv_empty
    end
  end

  def csv_graded_at(submission)
    if submission.graded_at
      format_datetime(submission.graded_at, :long, user: @current_user)
    else
      csv_empty
    end
  end

  def csv_grading_time(submission)
    if submission.graded_at && submission.submitted_at
      format_duration submission.graded_at.to_time.to_i - submission.submitted_at.to_time.to_i
    else
      csv_empty
    end
  end

  def csv_grader(submission)
    if submission.grader_ids
      graders = submission.grader_ids.map do |grader_id|
        @course_users_hash[grader_id]&.name || 'System'
      end
      graders.join(', ')
    else
      csv_empty
    end
  end

  def csv_publisher(submission)
    if submission.publisher
      course_user = @course_users_hash[submission.publisher_id]
      course_user ? course_user.name : submission.publisher.name
    else
      csv_empty
    end
  end
end
