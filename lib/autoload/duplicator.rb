# frozen_string_literal: true
class Duplicator
  attr_reader :time_shift, :new_course_title, :current_user

  # Create an instance of Duplicator to track duplicated objects.
  #
  # @param [Enumerable] excluded_objects An Enumerable of objects to be excluded from duplication
  # @param [DateTime] time_shift The amount of time to shift dates by
  # @param [String] new_course_title The new course title
  # @param [User] current_user Current user who initiated the duplication of the objects
  def initialize(excluded_objects = [], time_shift = 0, new_course_title = 'Duplicated',
                 current_user = User.system)
    @duplicated_objects = {} # hash to check what has been duplicated
    @exclusion_set = excluded_objects.to_set # set to check what should be excluded
    @time_shift = time_shift
    @new_course_title = new_course_title
    @current_user = current_user
  end

  # Deep copy the arguments to this function. Objects must provide an +initialize_duplicate+
  # method which duplicates its children.
  #
  # @overload duplicate(array_of_stuff)
  #   @param [Enumerable<#initialize_duplicate>] array_of_stuff Enumerable of objects
  #     to be duplicated.
  # @overload duplicate(something)
  #   @param [#initialize_duplicate] something A single object to be duplicated.
  # @return duplicated_stuff A reference to a single duplicated object or an Array of duplicated
  #   objects
  def duplicate(stuff)
    # Track if an enumerable or single object was passed in. Needed to handle single element
    # collections.
    # Note that ActiveRecord CollectionProxy is not an Enumerable, so check for to_a instead.
    return nil unless stuff
    stuff_is_enumerable = stuff.respond_to?(:to_a)
    duplicated_stuff = []
    stuff = [*stuff] unless stuff_is_enumerable
    stuff.each do |obj|
      duplicated_stuff << duplicate_object(obj)
    end
    stuff_is_enumerable ? duplicated_stuff : duplicated_stuff[0]
  end

  private

  # Deep copy +source_object+ and its children. +source_object+ must provide a
  # +initialize_duplicate+ method which duplicates its children.
  #
  # @param [#initialize_duplicate] source_object The object to be duplicated.
  # @return duplicated_object A reference to the duplicated object.
  def duplicate_object(source_object)
    @duplicated_objects.fetch(source_object) do |key|
      if !@exclusion_set.include?(key)
        source_object.dup.tap do |duplicate|
          @duplicated_objects[key] = duplicate
          duplicate.initialize_duplicate(self, key)
        end
      else
        @duplicated_objects[source_object] = nil
      end
    end
  end
end
