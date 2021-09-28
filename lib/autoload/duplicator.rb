# frozen_string_literal: true
class Duplicator
  attr_reader :options, :mode

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
    @time_shift_amount = options[:time_shift]
    @mode = options[:mode]
  end

  # Deep copies the given item(s) and initializes the duplicates by calling `initialize_duplicate`
  # on the duplicates.
  #
  # `initialize_duplicate` may further trigger duplication of the source item's
  # children. If a collection is given, some of the items to be duplicated might be associated.
  # `initialize_duplicate` may be used to associate the duplicates of associated items.
  #
  # Since the duplicator does not have any knowledge of what these items are, except for the fact that
  # they respond to `initialize_duplicate`, the duplicator does not impose an order on which items are
  # duplicated first. To simplify the process of associating duplicated objects, we give the responsibility
  # of forming the association to the object that is duplicated later.
  #
  # E.g. Suppose that `Group` has many `Student`s and the instance `student_a` belongs to the instance 'group_a'.
  # If `group_a` is duplicated first, then calling `duplicate_student_a.initialize_duplicate` should add
  # `duplicate_student_a` to `duplicate_group_a`'s list of students. If `student_a` is duplicated first, then
  # vice versa. Thus, the code to form the association can be found in both `Student#initialize_duplicate` and
  # `Group#initialize_duplicate`.
  #
  # @overload duplicate(array_of_stuff)
  #   @param [Enumerable<#initialize_duplicate>] array_of_stuff Enumerable of objects
  #     to be duplicated.
  # @overload duplicate(something)
  #   @param [#initialize_duplicate] something A single object to be duplicated.
  # @return duplicated_stuff A reference to a single duplicated object or an Array of duplicated
  #   objects
  def duplicate(stuff)
    map_item_or_collection(stuff) { |item| duplicate_object(item) }
  end

  # Time shifts the datetime passed to this function.
  # Cap the maximum datetime to 31 December 9999 0:00:00 as the frontend JS cannot support
  # 5 digit years.
  #
  # @param [DateTime] original_time The DateTime value to be time shifted.
  # @return [DateTime] The time shifted DateTime, capped to 31 December 9999.
  def time_shift(original_time)
    # TODO: Move max_time declaration to facilitate re-use.
    # config/application.rb could be unsuitable as `Time.zone.local` does not work there.
    max_time = Time.zone.local(9999, 12, 31, 0, 0, 0)
    shifted_time = original_time + @time_shift_amount
    shifted_time < max_time ? shifted_time : max_time
  end

  # Checks if an item has been duplicated.
  #
  # @param [#initialize_duplicate] source_object
  # @return [Boolean] true if source_object has been duplicated
  def duplicated?(source_object)
    @duplicated_objects.key?(source_object)
  end

  def set_option(key, value)
    @options[key] = value
  end

  private

  # Maps a block onto a single item or a collection of items. An array is returned if a collection received.
  # Otherwise, the result of the block is returned.
  def map_item_or_collection(item_or_collection, &block)
    item_or_collection.respond_to?(:to_ary) ? item_or_collection.map(&block) : yield(item_or_collection)
  end

  # See `#duplicate`.
  #
  # @param [#initialize_duplicate] source_object The object to be duplicated.
  # @return duplicated_object A reference to the duplicated object.
  def duplicate_object(source_object)
    return nil unless source_object

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
