# frozen_string_literal: true
require 'rails_helper'

RSpec.describe User::InstancePreloadService, type: :service do
  let(:instance) { create(:instance) }
  let(:instance2) { create(:instance) }
  with_tenant(:instance) do
    let!(:user) { create(:user) }
    let(:service) { User::InstancePreloadService.new(user.id) }
    let!(:instance_user) do
      ActsAsTenant.without_tenant { create(:instance_user, user: user, instance: instance2) }
    end

    it 'preloads the instances' do
      expect(service.instances_for(user.id)).to contain_exactly(instance, instance2)
    end
  end
end
