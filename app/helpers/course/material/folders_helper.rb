# frozen_string_literal: true
module Course::Material::FoldersHelper
  # Find the proper display name for the folder, if folder is root we will display the name of
  # material component.
  #
  # @param [Course::Material::Folder] folder The folder to be displayed.
  # @return [String] The proper display name of the folder.
  def display_folder(folder)
    folder.root? ? component.settings.title || t('course.material.sidebar_title') : folder.name
  end

  # Display an icon when the folder's start_at is in the future, but the course's advance_start_at
  # option already makes it visible to students.
  #
  # @param [Course::Material::Folder] folder The folder to be tested.
  # @return [Boolean] Whether the icon should be displayed.
  def show_sdl_warning?(folder)
    folder.effective_start_at < Time.zone.now && folder.start_at > Time.zone.now
  end
end
