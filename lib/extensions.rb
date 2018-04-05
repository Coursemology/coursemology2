# frozen_string_literal: true
module Extensions
  EXTENSIONS_PATH = "#{__dir__}/extensions"

  class << self
    # Loads all extensions defined in this directory.
    #
    # @return [void]
    def load_all
      Dir[EXTENSIONS_PATH + '/*.rb'].each do |ext|
        require ext
        load(const_get(module_name(File.basename(ext, '.*'))))
      end
    end

    # Loads the given extension.
    #
    # Extensions are prefixed with the +Extensions::Feature+ namespace, and mirrors the global
    # class hierarchy. Therefore, if a feature is called 'Awesome', and needs to extend
    # +ActiveRecord::Base+, then its methods should be in +Extensions::Awesome::ActiveRecord::Base+.
    #
    # Extensions can also extend the class itself. These methods should be placed in the
    # +ClassMethods+ module within the class to extend, i.e.
    # +Extensions::Awesome::ActiveRecord::Base::ClassMethods+.
    #
    # @param [Module] module_ The module to load.
    # @return [void]
    def load(module_)
      module_extensions(module_).each do |path|
        load_extension_file(module_, path)
      end
    end

    private

    # Gets the module name from the path.
    #
    # @param [String] module_path The path to the module.
    # @return [String] The name of the module.
    def module_name(module_path)
      dir_name = File.dirname(module_path)
      base_name = File.basename(module_path, '.*')
      dir_name == '.' ? base_name.camelize : "#{dir_name}/#{base_name}".camelize
    end

    # Gets the extensions that this module defines.
    #
    # @param [Module] module_ The module to load extensions for.
    # @return [Array<String>] The paths to the extensions this module defines, relative to the
    #   extension directory. The paths are sorted lexicographically, so parent modules are included
    #   before the actual extensions are.
    def module_extensions(module_)
      current_module_dir = module_dir(module_)

      current_module_dir_length = current_module_dir.length + 1
      extensions = Dir["#{current_module_dir}/**/*.rb"].map do |e|
        e[current_module_dir_length..-1]
      end

      extensions.sort!
      extensions
    end

    # Gets the path to the module directory, given the actual module.
    #
    # @param [Module] module_ The module to obtain the path to.
    # @return [String] The path to the module, excluding the file extension.
    def module_dir(module_)
      "#{__dir__}/#{module_.name.underscore}"
    end

    # Loads the file belonging to the extension.
    #
    # @param [Module] module_ The module containing the extension.
    # @param [String] path A path relative to the extension directory.
    # @return [void]
    def load_extension_file(module_, path)
      require "#{__dir__}/#{module_.name.underscore}/#{path}"

      expected_module_name = module_name(path)
      class_to_extend = expected_module_name.constantize
      warn "Class does not match: expected #{module_name(path)}, got #{class_to_extend}. Maybe "\
        "#{module_name(path)} has not been defined?" if expected_module_name != class_to_extend.name

      module_to_include = "#{module_.name}::#{class_to_extend}".constantize
      extend_class(class_to_extend, module_to_include)
    end

    # Extends the given +class_+ with the given +module_+.
    #
    # Two special submodules are recognised:
    # - ClassMethods would inject the module into the class.
    # - PrependMethods would be prepended instead of included into the class.
    #
    # @param [Class] class_ The class to extend.
    # @param [Module] module_ The module to extend the class with.
    # @return [void]
    def extend_class(class_, module_)
      class_.class_eval do
        include module_
        extend module_.const_get(:ClassMethods) if module_.const_defined?(:ClassMethods, false)
        prepend module_.const_get(:PrependMethods) if module_.const_defined?(:PrependMethods, false)
      end
    end
  end
end
