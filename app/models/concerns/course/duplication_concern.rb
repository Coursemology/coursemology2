# frozen_string_literal: true
module Course::DuplicationConcern
  extend ActiveSupport::Concern

  def initialize_duplicate(duplicator, other)
    self.start_at = duplicator.time_shift(start_at)
    self.end_at = duplicator.time_shift(end_at)
    self.title = duplicator.options[:new_title]
    self.creator = duplicator.options[:current_user]
    self.registration_key = nil
    logo.duplicate_from(other.logo) if other.logo_url
    material_folders << duplicator.duplicate(other.root_folder)
  end

  # List of top-level items that need to be duplicated for the whole course to be considered duplicated.
  def duplication_manifest # rubocop:disable Metrics/MethodLength
    [
      *material_folders.concrete,
      *materials.in_concrete_folder,
      *levels,
      *assessment_categories,
      *assessment_tabs,
      *assessments,
      *assessment_skills,
      *assessment_skill_branches,
      *achievements,
      *surveys,
      *video_tabs,
      *videos,
      *lesson_plan_events,
      *lesson_plan_milestones,
      *forums
    ]
  end
end
