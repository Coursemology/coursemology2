require 'set'

class Duplicator
  def initialize
    @duplicated_objects = {}  # hash to check what has been duplicated
    @to_dup_objects = Set.new # hash to check what should be duplicated
  end

  # Check the duplicated_objects hash to see if source_object has already been duplicated.
  # If it has, return it.
  # Else check if it should be duplicated. If yes, call its duplicate method.
  # Else save nil into the hash and return nil.
  #
  # @param source_object [Object] The object to be duplicated.
  # @return duplicated_object A reference to the duplicated object.
  def duplicate_object(source_object)
    if @duplicated_objects.has_key?(source_object)
      @duplicated_objects[source_object]
    elsif @to_dup_objects.include?(source_object)
      @duplicated_objects[source_object] = source_object.duplicate(self)
    else
      @duplicated_objects[source_object] = nil
    end
  end

  # Take in a list of checked objects from the DuplicationView and duplicate them all.
  # Also convert the list to a hash for faster lookup.
  #
  # @param to_duplicate_list [Array] The list of objects selected for duplication.
  # @return [void]
  def duplicate(to_duplicate_list)
    @to_dup_objects = to_duplicate_list.to_set
    to_duplicate_list.each do |item|
      duplicate_object(item)
    end
  end

  # Returns the duplicate of an object if it exists, nil otherwise.
  #
  # @param [Object] object
  # @return [Object, nil]
  def duplicate_of(object)
    @duplicated_objects[object]
  end
end
