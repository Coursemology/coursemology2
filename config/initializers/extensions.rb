Rails.application.config.before_initialize do
  extensions_path = "#{Rails.root}/lib/extensions"

  # Load the base Extensions module
  require "#{extensions_path}.rb"

  # Get the extensions, sort by file name so the parent modules are included first
  extensions = Dir["#{extensions_path}/**/*.rb"]
  extensions.sort!

  extensions.each do |path|
    require path

    # Deduce the class we are trying to extend
    relative_path = path.slice(extensions_path.length + 1, path.length)
    relative_dir = File.dirname(relative_path)
    relative_dir =
      if relative_dir == '.'
        ''
      else
        relative_dir + '/'
      end
    filename = File.basename(relative_path, File.extname(relative_path))
    relative_filename = "#{relative_dir}#{filename}"

    class_to_extend = relative_filename.camelize
    module_to_include_name = "Extensions::#{class_to_extend}"
    module_to_include = module_to_include_name.constantize
    module_to_extend_name = "#{module_to_include}::ClassMethods"

    class_to_extend.constantize.class_eval do
      include module_to_include
      if module_to_include.const_defined?(module_to_extend_name, false)
        extend module_to_extend.constantize
      end
    end
  end
end
