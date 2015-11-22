class Polyglot::Language::Python < Polyglot::Language
  class Python2Point7 < Polyglot::Language::Python
    class << self
      def instance
        root
      end

      def display_name
        'Python 2.7'
      end
    end
  end

  class Python3Point4 < Polyglot::Language::Python
    class << self
      def instance
        root
      end

      def display_name
        'Python 3.4'
      end
    end
  end
end
