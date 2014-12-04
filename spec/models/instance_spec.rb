require 'rails_helper'

RSpec.describe Instance, type: :model do
  describe '.default' do
    it 'should return the default instance' do
      default_instance = Instance.default
      expect(default_instance.host).to eq('*')
    end
  end

  describe '.find_tenant_by_hostname' do
    before do
      @instances = create_list(:instance, 3)
    end

    it 'should find the correct tenant if the hostname is correct' do
      first_instance = @instances[0]
      found_instance = Instance.find_tenant_by_hostname(first_instance.host)

      expect(found_instance).to eq(first_instance)
    end
  end
end
