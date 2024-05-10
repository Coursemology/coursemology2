# frozen_string_literal: true
module CourseConcern
  module Material::Folder::OrderingConcern
    extend ActiveSupport::Concern

    # Sorts all folders in a collection in topological order.
    #
    # By convention, each folder is represented by an array. The first element is the folder itself,
    # the second is the children of the array.
    class FolderSort
      include Enumerable
      delegate :each, to: :@sorted
      delegate :length, to: :@sorted
      delegate :flatten, to: :@sorted
      alias_method :size, :length

      # Constructor.
      #
      # @param [Array<Course::Material::Folder>] folders The folders to sort.
      def initialize(folders)
        @folders = folders
        @sorted = sort(nil)
      end

      # Retrieves the last folder topologically -- the last folder at every branch.
      #
      # @return [Course::Material::Folder] The last folder topologically.
      # @return [nil] When there are no folders.
      def last
        current_thread = @sorted.last
        return nil unless current_thread

        current_thread = current_thread.second.last until current_thread.second.empty?
        current_thread.first
      end

      private

      def sort(folder_id)
        children_folders, @folders = @folders.partition { |child_folder| child_folder.parent_id == folder_id }
        children_folders.map do |child_folder|
          [child_folder].push(sort(child_folder.id))
        end
      end
    end

    # Returns a set of recursive arrays indicating the parent-child relationships of folders.
    #
    # @return [Enumerable]
    def ordered_topologically
      FolderSort.new(self)
    end
  end
end
