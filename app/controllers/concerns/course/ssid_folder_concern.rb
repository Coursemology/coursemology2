# frozen_string_literal: true
module Course::SsidFolderConcern
  extend ActiveSupport::Concern

  def sync_course_ssid_folder(course)
    return if course.ssid_folder_id

    folder_id = create_ssid_folder("coursemology_course_#{course.id}")
    course.update!(ssid_folder_id: folder_id)
  end

  def sync_assessment_ssid_folder(course, assessment)
    return if assessment.ssid_folder_id

    sync_course_ssid_folder(course) unless course.ssid_folder_id

    # create a new assessment folder for each run
    folder_id = create_ssid_folder("assessment_#{assessment.id}", course.ssid_folder_id)
    assessment.update!(ssid_folder_id: folder_id)
  end

  private

  def create_ssid_folder(folder_name, parent_folder_id = nil)
    folder_service = Course::SsidFolderService.new(folder_name, parent_folder_id)
    folder_service.run_create_ssid_folder_service
  end
end
