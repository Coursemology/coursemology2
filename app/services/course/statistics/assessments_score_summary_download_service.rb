# frozen_string_literal: true
require 'csv'
class Course::Statistics::AssessmentsScoreSummaryDownloadService
  include TmpCleanupHelper
  include ApplicationFormattersHelper

  def initialize(course, assessment_ids, file_name)
    @course = course
    @assessment_ids = assessment_ids
    @file_name = file_name
    @base_dir = Dir.mktmpdir('assessment-score-summary-')
  end

  def generate
    ActsAsTenant.without_tenant do
      generate_csv_report
    end
  end

  def generate_csv_report
    assessment_score_summary_file_path = File.join(@base_dir, @file_name)

    load_total_grades
    CSV.open(assessment_score_summary_file_path, 'w') do |csv|
      download_score_summary(csv)
    end

    assessment_score_summary_file_path
  end

  private

  def cleanup_entries
    [@base_dir]
  end

  def load_total_grades
    @course_assessment_hash = Course::Assessment.where(id: @assessment_ids, course_id: @course.id).to_h do |assessment|
      [assessment.id, assessment]
    end

    @assessments = assessments
    @submissions = Course::Assessment::Submission.where(assessment_id: @assessments.map(&:id)).
                   calculated(:grade).
                   preload(creator: :course_users)

    @submission_grade_hash = submission_grade_hash
    @all_students = @course.course_users.students.order_alphabetically.preload(user: :emails)
  end

  def submission_grade_hash
    @submissions.to_h do |submission|
      course_user = submission.creator.course_users.find { |u| u.course_id == @course.id }
      [[course_user.id, submission.assessment_id], submission.grade]
    end
  end

  def assessments
    @assessment_ids.filter { |assessment_id| !@course_assessment_hash[assessment_id.to_i].nil? }.map do |assessment_id|
      @course_assessment_hash[assessment_id.to_i]
    end
  end

  def download_score_summary(csv)
    # header
    csv << [
      I18n.t('csv.score_summary.headers.name'),
      I18n.t('csv.score_summary.headers.email'),
      I18n.t('csv.score_summary.headers.type'),
      *@assessments.map(&:title)
    ]

    # content
    @all_students.each do |student|
      csv << [student.name, student.user.email, student.phantom? ? 'phantom' : 'normal',
              *@assessments.flat_map do |assessment|
                @submission_grade_hash[[student.id, assessment.id]] || ''
              end]
    end
  end
end
