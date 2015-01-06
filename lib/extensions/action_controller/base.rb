module Extensions::ActionController::Base
  def current_layout
    _layout
  end

  def parent_layout(klass = nil)
    klass ||= self.class
    klass = klass.superclass
    while Extensions::ActionController::Base.class_layout(klass, self) == current_layout
      klass = klass.superclass
    end

    Extensions::ActionController::Base.class_layout(klass, self)
  end

  def self.class_layout(klass, self_)
    layout_method = klass.instance_method(:_layout)
    _layout = layout_method.bind(self_)
    _layout.call
  end
end
