require 'rspec/expectations'
require 'action_view/record_identifier'

RSpec::Matchers.define :have_content_tag_for do |resource|
  include ActionView::RecordIdentifier
  match do |page|
    expect(page).to have_selector(".#{dom_class(resource)}\##{dom_id(resource)}")
  end
end
