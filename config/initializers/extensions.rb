Rails.application.config.before_initialize do
  require "#{Rails.root}/lib/extensions.rb"

  Extensions.load_all
end
