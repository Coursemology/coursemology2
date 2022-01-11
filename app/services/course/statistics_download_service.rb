# frozen_string_literal: true
require 'csv'

class Course::StatisticsDownloadService
  class << self
    # Downloads the student data to its own folder in the base directory.
    #
    # @return [String] The path to the CSV file.
    def download(course, course_user, can_analyze_videos, only_my_students)
      statistics_csv = nil
      ActsAsTenant.without_tenant do
        statistics_csv = generate_csv(course, course_user, can_analyze_videos, only_my_students)
      end
      base_dir = Dir.mktmpdir('coursemology-statistics-')
      dst_path = File.join(base_dir, 'students.csv')
      File.open(dst_path, 'w') do |dst_file|
        dst_file.write(statistics_csv)
      end
      dst_path
    end

    private

    # Converts the student data to string CSV format.
    #
    # @return [String] The student data in CSV format.
    def generate_csv(course, course_user, can_analyze_videos, only_my_students) # rubocop:disable Metrics/AbcSize
      # Pre-loads course levels to avoid N+1 queries when course_user.level_numbers are displayed.
      course.levels.to_a

      course_users = course.course_users.includes(:groups)
      service = Course::GroupManagerPreloadService.new(course_users.staff)
      no_group_managers = service.no_group_managers?

      course_videos = course.videos
      has_video_data = course_videos.exists? && can_analyze_videos

      is_course_gamified = course.gamified?

      header = generate_header(no_group_managers, is_course_gamified, has_video_data, course_videos&.count)

      students = (only_my_students ? course_user.my_students : course_users.students).
                 ordered_by_experience_points.
                 with_video_statistics

      CSV.generate(headers: true, force_quotes: true) do |csv|
        csv << header
        students.each do |student|
          csv << generate_row(student, service, no_group_managers, is_course_gamified, has_video_data)
        end
      end
    end

    def generate_header(no_group_managers, is_course_gamified, has_video_data, video_count)
      [
        CourseUser.human_attribute_name(:name),
        I18n.t('course.statistics.csv_download_service.email'),
        I18n.t('course.statistics.csv_download_service.user_type'),
        (I18n.t('course.statistics.table.tutor') unless no_group_managers),
        (Course::Level.model_name.human if is_course_gamified),
        (I18n.t('course.statistics.table.experience_points') if is_course_gamified),
        (I18n.t('course.statistics.table.video_watched', total: video_count) if has_video_data),
        (I18n.t('course.statistics.table.percent_watched') if has_video_data)
      ].compact
    end

    def generate_row(student, group_manager_service, no_group_managers, is_course_gamified, has_video_data)
      [
        student.name,
        student.user.email,
        generate_user_type(student),
        (generate_tutor_names(student, group_manager_service) unless no_group_managers),
        (student.level_number if is_course_gamified),
        (student.experience_points if is_course_gamified),
        (student.video_submission_count if has_video_data),
        (I18n.t('course.statistics.table.progress', progress: student.video_percent_watched || 0) if has_video_data)
      ].compact
    end

    def generate_user_type(student)
      if student.phantom?
        I18n.t('course.statistics.csv_download_service.phantom')
      else
        I18n.t('course.statistics.csv_download_service.normal')
      end
    end

    def generate_tutor_names(student, group_manager_service)
      group_manager_service.group_managers_of(student).map(&:name).join(', ')
    end
  end
end
