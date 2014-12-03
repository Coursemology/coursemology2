require 'rails_helper'

RSpec.describe Instance, type: :model do
  it 'should return the default instance' do
    default_instance = Instance.default
    expect(default_instance.host).to eq('*')
  end
end
