require 'rails_helper'

RSpec.describe 'Devise Pages' do
  it 'displays the proper page action class' do
    get '/users/sign_in'
    expect(response.body).to have_tag('div.devise_sessions')
  end
end
