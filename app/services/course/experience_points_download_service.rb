# frozen_string_literal: true
require 'csv'
class Course::ExperiencePointsDownloadService
  include ApplicationFormattersHelper

  class << self
    def download(current_course, course_user_id)
      service = new(current_course, course_user_id)
      ActsAsTenant.without_tenant do
        service.generate_csv_report
      end
    end
  end

  def generate_csv_report
    exp_points_records = if @course_user_id
                           Course::ExperiencePointsRecord.where(course_user_id: @course_user_id)
                         else
                           Course::ExperiencePointsRecord.where(course_user_id: @current_course.course_users.pluck(:id))
                         end
    exp_points_file_path = File.join(@base_dir, 'records.csv')
    updater_ids = exp_points_records.active.pluck(:updater_id)
    @updater_preload_service =
      Course::CourseUserPreloadService.new(updater_ids, @current_course)
    exp_points_records = exp_points_records.active.order(updated_at: :desc)
    CSV.open(exp_points_file_path, 'w') do |csv|
      download_exp_points_header csv
      exp_points_records.each do |record|
        download_exp_points csv, record
      end
    end
    exp_points_file_path
  end

  private

  def initialize(current_course, course_user_id)
    @course_user_id = course_user_id
    @current_course = current_course
    @base_dir = Dir.mktmpdir('experience-points-')
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

    @reason = if record.manually_awarded?
                record.reason
              else
                case record.specific.actable
                when Course::Assessment::Submission
                  record.specific.assessment.title
                when Course::Survey::Response
                  record.specific.survey.title
                end
              end

    csv << [record.updated_at,
            record.course_user.name,
            point_updater.name,
            @reason,
            record.points_awarded]
  end
end
