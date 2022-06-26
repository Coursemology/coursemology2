# frozen_string_literal: true
require 'csv'
class Course::Assessment::Submission::StatisticsDownloadService
  include ApplicationFormattersHelper

  class << self
    # Downloads the statistics and zip them.
    #
    # @param [Course] current_course The current course the submissions belong to
    # @param [User] current_user The current user downloading the statistics.
    # @param [Array<Integer>] submission_ids The ids of the submissions to download statistics for
    # @return [String] The path to the csv file.
    def download(current_course, current_user, submission_ids)
      service = new(current_course, current_user, submission_ids)
      ActsAsTenant.without_tenant do
        service.generate_csv_report
      end
    end
  end

  def generate_csv_report
    submissions = Course::Assessment::Submission.
                  where(id: @submission_ids).
                  calculated(:log_count, :graded_at, :grade, :grader_ids).
                  includes(:course_user, :publisher)
    assessment = submissions&.first&.assessment&.calculated(:maximum_grade)
    @course_users_hash ||= @current_course.course_users.map { |cu| [cu.user_id, [cu.id, cu.name]] }.to_h
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

  def initialize(current_course, current_user, submission_ids)
    @current_user = current_user
    @submission_ids = submission_ids
    @current_course = current_course
    @base_dir = Dir.mktmpdir('coursemology-statistics-')
  end

  def download_statistics_header(csv)
    csv << [I18n.t('course.assessment.submission.submissions.statistics_download_service.name'),
            I18n.t('course.assessment.submission.submissions.statistics_download_service.phantom'),
            I18n.t('course.assessment.submission.submissions.statistics_download_service.status'),
            I18n.t('course.assessment.submission.submissions.statistics_download_service.grade'),
            I18n.t('course.assessment.submission.submissions.statistics_download_service.max_grade'),
            I18n.t('course.assessment.submission.submissions.statistics_download_service.exp_points'),
            I18n.t('course.assessment.submission.submissions.statistics_download_service.start_date_time'),
            I18n.t('course.assessment.submission.submissions.statistics_download_service.submitted_date_time'),
            I18n.t('course.assessment.submission.submissions.statistics_download_service.time_taken'),
            I18n.t('course.assessment.submission.submissions.statistics_download_service.graded_date_time'),
            I18n.t('course.assessment.submission.submissions.statistics_download_service.grading_time'),
            I18n.t('course.assessment.submission.submissions.statistics_download_service.grader'),
            I18n.t('course.assessment.submission.submissions.statistics_download_service.publisher')]
  end

  def download_statistics(csv, submission, assessment)
    csv << [submission.course_user.name,
            submission.course_user.phantom?,
            submission.workflow_state,
            submission.grade.to_f,
            assessment.maximum_grade,
            csv_exp_points(submission),
            csv_created_at(submission),
            csv_submitted_date_time(submission),
            csv_time_taken(submission),
            csv_graded_at(submission),
            csv_grading_time(submission),
            csv_grader(submission),
            csv_publisher(submission)]
  end

  def csv_empty
    I18n.t('course.assessment.submission.submissions.statistics_download_service.csv_empty')
  end

  def csv_time_taken(submission)
    if submission.submitted_at && submission.created_at
      format_duration submission.submitted_at.to_time.to_i - submission.created_at.to_time.to_i
    else
      csv_empty
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
        cu = @course_users_hash[grader_id] || [0, 'System']
        cu[1]
      end
      graders.join(', ')
    else
      csv_empty
    end
  end

  def csv_publisher(submission)
    if submission.publisher
      course_user = submission.publisher.course_users.
                    find_by(course_id: submission.assessment.course_id)
      if course_user
        course_user.name
      else
        submission.publisher.name
      end
    else
      csv_empty
    end
  end
end
