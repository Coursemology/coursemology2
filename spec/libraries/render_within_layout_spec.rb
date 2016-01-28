# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: render within_layout', type: :view do
  let(:views_directory) do
    path = Pathname.new("#{__dir__}/../fixtures/libraries/render_within_layout")
    path.realpath
  end

  before do
    controller.prepend_view_path views_directory
  end

  it 'properly nests' do
    render template: 'content', layout: 'inner_layout'
    expect(rendered).to have_tag('div.outer') do
      with_tag('div.inner') do
        with_text(/test!/)
      end
    end
  end
end
