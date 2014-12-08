require 'rails_helper'

RSpec.describe InstanceUser, type: :model do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let!(:user) { create(:user) }
    let!(:instance_user) do
      result = InstanceUser.create(instance: instance, user: user)
      instance.reload
      user.reload
      result
    end

    it 'should be able to find the instance' do
      expect(instance_user.instance).to eq(instance)
    end

    it 'should be able to find the user' do
      expect(instance_user.user).to eq(user)
    end

    it 'should allow the user to find the instance' do
      expect(user.instances.count).to eq(1)
      expect(user.instances.first).to eq(instance)
    end

    it 'should allow the instance to find the user' do
      expect(instance.users.count).to eq(1)
      expect(instance.users.first).to eq(user)
    end
  end
end
