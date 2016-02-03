# frozen_string_literal: true
module Course::Material::FoldersHelper
  # Find the proper display name for the folder, if folder is root we will display the name of
  # material component.
  #
  # @param [Course::Material::Folder] The folder to be displayed.
  # @return [String] The proper display name of the folder.
  def display_folder(folder)
    folder.root? ? component.settings.title || t('course.material.sidebar_title') : folder.name
  end
end
