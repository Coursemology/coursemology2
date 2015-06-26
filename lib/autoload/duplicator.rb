class Duplicator
  # Create an instance of Duplicator to track duplicated objects.
  #
  # @param [Array] excluded_objects A list of objects to be excluded from duplication
  def initialize(excluded_objects=[])
    @duplicated_objects = {}  # hash to check what has been duplicated
    @exclusion_set = excluded_objects.to_set  # set to check what should be excluded
  end

  # Deep copy source_object and its children. source_object must provide a duplicate
  # method which duplicates its children.
  #
  # @param [Object#duplicate] source_object The object to be duplicated.
  # @return duplicated_object A reference to the duplicated object.
  def duplicate_object(source_object)
    if @duplicated_objects.has_key?(source_object)
      @duplicated_objects[source_object]
    elsif not @exclusion_set.include?(source_object)
      @duplicated_objects[source_object] = source_object.dup
      source_object.duplicate(self)
      @duplicated_objects[source_object]
    else
      @duplicated_objects[source_object] = nil
    end
  end
end
