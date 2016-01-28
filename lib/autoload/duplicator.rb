# frozen_string_literal: true
class Duplicator
  # Create an instance of Duplicator to track duplicated objects.
  #
  # @param [Enumerable] excluded_objects An Enumerable of objects to be excluded from duplication
  def initialize(excluded_objects = [])
    @duplicated_objects = {}  # hash to check what has been duplicated
    @exclusion_set = excluded_objects.to_set  # set to check what should be excluded
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
    duplicated_stuff = []
    stuff = [*stuff] unless stuff.is_a?(Enumerable)
    stuff.each do |obj|
      duplicated_stuff << duplicate_object(obj)
    end
    duplicated_stuff.length == 1 ? duplicated_stuff[0] : duplicated_stuff
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
