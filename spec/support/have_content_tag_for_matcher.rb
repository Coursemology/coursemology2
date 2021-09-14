# frozen_string_literal: true
require 'rspec/expectations'
require 'action_view/record_identifier'

module ContentTag; end
module ContentTag::TestExampleHelpers; end

module ContentTag::TestExampleHelpers::FeatureHelpers
  include ActionView::RecordIdentifier
  def content_tag_selector(resource, options = {})
    additional_classes = ".#{Array(options[:class]).join('.')}" if options[:class]
    "#{additional_classes}.#{dom_class(resource)}\##{dom_id(resource)}"
  end
end

RSpec::Matchers.define :have_content_tag_for do |resource|
  include ContentTag::TestExampleHelpers::FeatureHelpers
  match do |page|
    expect(page).to have_selector(content_tag_selector(resource))
  end
end

RSpec::Matchers.define :have_no_content_tag_for do |resource|
  include ContentTag::TestExampleHelpers::FeatureHelpers
  match do |page|
    expect(page).to have_no_selector(content_tag_selector(resource))
  end
end

RSpec.configure do |config|
  config.include ContentTag::TestExampleHelpers::FeatureHelpers, type: :feature
end
