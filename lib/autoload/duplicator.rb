# frozen_string_literal: true
class Duplicator
  attr_reader :options, :time_shift, :mode

  # Create an instance of Duplicator to track duplicated objects.
  #
  # Options are used to store information that persists across duplication of objects.
  #
  # @param [Enumerable] excluded_objects An Enumerable of objects to be excluded from duplication
  # @param [Hash] options Set of options to be stored in the duplicator object.
  def initialize(excluded_objects = [], options = {})
    @duplicated_objects = {} # hash to check what has been duplicated
    @exclusion_set = excluded_objects.to_set # set to check what should be excluded
    @options = options
    @time_shift = options[:time_shift]
    @mode = options[:mode]
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
      duplicated_object = duplicate_object(obj)
      duplicated_stuff << duplicated_object unless duplicated_object.nil?
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
