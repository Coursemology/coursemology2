# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: render partial with prefix suffix', type: :view do
  let(:views_directory) do
    path = Pathname.new("#{__dir__}/../fixtures/libraries/render_partial_with_prefix_suffix")
    path.realpath
  end
  let(:collection) do
    [self.class::Object.new]
  end

  before do
    controller.prepend_view_path views_directory
  end

  class self::Object
    def to_partial_path
      'base'
    end
  end

  it 'properly uses the prefix' do
    render partial: collection, prefix: 'prefix'
    expect(rendered).to have_tag('div.prefix')
    expect(rendered).not_to have_tag('div.base')
    expect(rendered).not_to have_tag('div.suffix')
  end

  it 'properly uses the suffix' do
    render partial: collection, suffix: 'suffix'
    expect(rendered).not_to have_tag('div.prefix')
    expect(rendered).not_to have_tag('div.base')
    expect(rendered).to have_tag('div.suffix')
  end
end
