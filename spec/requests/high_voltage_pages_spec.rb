require 'rails_helper'

RSpec.describe 'High Voltage Pages' do
  it 'displays the proper page action class' do
    get '/'
    expect(response.body).to have_tag('div.home')
  end
end
