module Extensions::ActiveRecord::Base
  def self.included(class_)
    class_.class_eval do
      def self.currently_valid
        where do
          (valid_from.nil? || valid_from <= DateTime.now) &&
            (valid_to.nil? || valid_to >= DateTime.now)
        end
      end
    end
  end

  def currently_valid?
    (valid_from.nil? || valid_from <= DateTime.now) &&
      (valid_to.nil? || valid_to >= DateTime.now)
  end
end
