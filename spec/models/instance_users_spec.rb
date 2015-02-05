require 'rails_helper'

RSpec.describe InstanceUser, type: :model do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    it { should belong_to(:instance) }
    it { should belong_to(:user) }

    let!(:user) { create(:user) }
    let!(:instance_user) do
      result = InstanceUser.create(instance: instance, user: user)
      instance.reload
      user.reload
      result
    end

    it 'finds the instance' do
      expect(instance_user.instance).to eq(instance)
    end

    it 'finds the user' do
      expect(instance_user.user).to eq(user)
    end

    it 'expects to be normal role by default' do
      expect(instance_user.normal?).to eq(true)
    end

    it 'allows the user to find the instance' do
      expect(user.instances.count).to eq(1)
      expect(user.instances.first).to eq(instance)
    end

    it 'allows the instance to find the user' do
      expect(instance.users.count).to eq(1)
      expect(instance.users.first).to eq(user)
    end
  end
end
