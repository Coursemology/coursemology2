# frozen_string_literal: true
require 'csv'
class Course::ExperiencePointsDownloadService
  include TmpCleanupHelper
  include ApplicationFormattersHelper

  def initialize(course, course_user_id)
    @course = course
    @course_user_id = course_user_id || course.course_users.pluck(:id)
    @base_dir = Dir.mktmpdir('experience-points-')
  end

  def generate
    ActsAsTenant.without_tenant do
      generate_csv_report
    end
  end

  def generate_csv_report
    exp_points_file_path = File.join(@base_dir, "#{Pathname.normalize_filename(@course.title)}_exp_records.csv")

    exp_points_records = load_exp_points_records
    @updater_preload_service = load_exp_record_updater_service(exp_points_records)
    CSV.open(exp_points_file_path, 'w') do |csv|
      download_exp_points_header(csv)
      exp_points_records.each do |record|
        download_exp_points(csv, record)
      end
    end
    exp_points_file_path
  end

  private

  def cleanup_entries
    [@base_dir]
  end

  def load_exp_points_records
    Course::ExperiencePointsRecord.where(course_user_id: @course_user_id).
      active.
      preload([{ actable: [:assessment, :survey] }, :updater]).
      includes(:course_user).
      order(updated_at: :desc)
  end

  def load_exp_record_updater_service(exp_points_records)
    updater_ids = exp_points_records.pluck(:updater_id)
    Course::CourseUserPreloadService.new(updater_ids, @course)
  end

  def download_exp_points_header(csv)
    csv << [I18n.t('course.experience_points_records.download.updated_at'),
            I18n.t('course.experience_points_records.download.name'),
            I18n.t('course.experience_points_records.download.updater'),
            I18n.t('course.experience_points_records.download.reason'),
            I18n.t('course.experience_points_records.download.exp_points')]
  end

  def download_exp_points(csv, record)
    point_updater = @updater_preload_service.course_user_for(record.updater) || record.updater

    reason = if record.manually_awarded?
               record.reason
             else
               case record.specific.actable
               when Course::Assessment::Submission
                 record.specific.assessment.title
               when Course::Survey::Response
                 record.specific.survey.title
               when Course::ScholaisticSubmission # rubocop:disable Lint/DuplicateBranch
                 record.specific.assessment.title
               end
             end

    csv << [record.updated_at,
            record.course_user.name,
            point_updater.name,
            reason,
            record.points_awarded]
  end
end
