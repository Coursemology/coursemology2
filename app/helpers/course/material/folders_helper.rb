# frozen_string_literal: true
module Course::Material::FoldersHelper
  # Display an icon when the folder's start_at is in the future, but the course's advance_start_at
  # option already makes it visible to students.
  #
  # @param [Course::Material::Folder] folder The folder to be tested.
  # @return [Boolean] Whether the icon should be displayed.
  def show_sdl_warning?(folder)
    folder.effective_start_at < Time.zone.now && folder.start_at > Time.zone.now
  end
end
