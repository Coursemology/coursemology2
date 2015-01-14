module Extensions::ActionController::Base
  # Gets the current layout used by this controller.
  #
  # @return [String] The layout used by the current controller.
  def current_layout
    _layout
  end

  # Gets the parent layout of the given layout, as specified in the layout hierarchy.
  #
  # @param of_layout [String] The layout to obtain the parent of. If this is nil, obtains the
  #                           current controller's parent layout.
  # @return [String] The parent layout of the given layout.
  def parent_layout(of_layout: nil)
    layout = of_layout || current_layout
    layout_index = layout_hierarchy.find_index(layout)
    return nil if layout_index.nil? || layout_index == 0

    layout_hierarchy[layout_index - 1]
  end

  # Gets the layout hierarchy, from the outermost to the innermost layout.
  #
  # @return [Array<String>] The layout hierarchy for this controller.
  def layout_hierarchy
    @layout_hierarchy ||=
      Extensions::ActionController::Base.class_hierarchy(self.class).
        select { |klass| klass < ActionController::Base }.
        map { |klass| Extensions::ActionController::Base.class_layout(klass, self) }.
        select { |layout| !layout.nil? }.
        reduce([]) do |memo, layout|
          if memo.empty? || memo.last != layout
            memo << layout
          else
            memo
          end
        end.
        reverse!
  end

  # Gets the superclass hierarchy for the given class. Object is not part of the returned result.
  #
  # @param klass [Class] The class to obtain the hierarchy of.
  # @return [Array<String>] The superclass hierarchy for the given class.
  def self.class_hierarchy(klass)
    result = []
    while klass != Object
      result << klass
      klass = klass.superclass
    end

    result
  end

  # Gets the layout for objects of the given class.
  #
  # @param klass [Class] The class to obtain the layout of. This must be a subclass of
  #                      ActionController::Base
  # @param self_ [ActionController::Base] The instance to query against the class hierarchy.
  # @return [String] The layout to use for instances of `klass`.
  def self.class_layout(klass, self_)
    layout_method = klass.instance_method(:_layout)
    _layout = layout_method.bind(self_)
    _layout.call
  end
end
