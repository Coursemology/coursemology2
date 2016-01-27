# This file should be removed when rspec/rspec-rails#1533 is merged.
RSpec::Rails::ViewRendering::EmptyTemplatePathSetDecorator.class_eval do
  alias_method :find_all_anywhere, :find_all
end
