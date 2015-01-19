module Extensions::ActiveRecord::Base
  def self.included(class_)
    class_.scope(:currently_valid, ->() do
      where { valid_from <= NOW() && valid_to >= NOW() }
    end)
  end

  def currently_valid?
    valid_from <= DateTime.now && valid_to >= DateTime.now
  end
end
