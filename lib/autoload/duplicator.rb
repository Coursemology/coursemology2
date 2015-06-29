class Duplicator
  # Create an instance of Duplicator to track duplicated objects.
  #
  # @param [Enumerable] excluded_objects An Enumerable of objects to be excluded from duplication
  def initialize(excluded_objects = [])
    @duplicated_objects = {}  # hash to check what has been duplicated
    @exclusion_set = excluded_objects.to_set  # set to check what should be excluded
  end

  # Deep copy +stuff+ and its children. +stuff+ can be a single object or an Enumerable of
  # objects which must provide a duplicate method which duplicates its children.
  #
  # @param[#initialize_duplicate|Enumerable#initialize_duplicate] stuff Either a single object
  # or Enumerable of objects to be duplicated.
  # @return duplicated_stuff A reference to a single duplicated object or an Array of duplicated
  # objects
  def duplicate(stuff)
    duplicated_stuff = []
    stuff = [*stuff] unless stuff.is_a?(Enumerable)
    stuff.each do |obj|
      duplicated_stuff << duplicate_object(obj)
    end
    duplicated_stuff.length == 1 ? duplicated_stuff[0] : duplicated_stuff
  end

  private

  # Deep copy +source_object+ and its children. +source_object+ must provide a duplicate
  # method which duplicates its children.
  #
  # @param [#initialize_duplicate] source_object The object to be duplicated.
  # @return duplicated_object A reference to the duplicated object.
  def duplicate_object(source_object)
    if @duplicated_objects.key?(source_object)
      @duplicated_objects[source_object]
    elsif !@exclusion_set.include?(source_object)
      @duplicated_objects[source_object] = source_object.dup
      source_object.initialize_duplicate(self)
      @duplicated_objects[source_object]
    else
      @duplicated_objects[source_object] = nil
    end
  end
end
