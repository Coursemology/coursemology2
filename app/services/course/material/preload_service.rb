# frozen_string_literal: true

# Preloads Materials for a given Course.
class Course::Material::PreloadService
  def initialize(course)
    @course = course
  end

  # @param [Integer] assessment_id
  # @return [Course::Material::Folder] Folder for the given assessment
  def folder_for_assessment(assessment_id)
    folders_for_assessment_hash[assessment_id]
  end

  private

  def folders_for_assessment_hash
    @folders_for_assessment_hash ||= assessments_folders.map do |folder|
      [folder.owner_id, folder]
    end.to_h
  end

  def assessments_folders
    @assessments_folders ||=
      @course.material_folders.includes(:materials).
      where('course_material_folders.owner_type = ?', Course::Assessment.name)
  end
end
