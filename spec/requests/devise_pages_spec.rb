# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Devise Pages' do
  it 'displays the proper page action class' do
    get new_user_password_path
    expect(response.body).to have_tag('div.devise-passwords')
  end
end
