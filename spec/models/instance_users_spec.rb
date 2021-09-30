# frozen_string_literal: true
require 'rails_helper'

RSpec.describe InstanceUser, type: :model do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    it { is_expected.to belong_to(:instance).without_validating_presence }
    it { is_expected.to belong_to(:user) }

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

    describe '.search' do
      let(:keyword) { 'KeyWord' }
      let!(:instance_user_with_keyword_in_username) do
        create(:user, emails_count: 2, name: "Awesome#{keyword}User").instance_users.last
      end
      let!(:instance_user_with_keyword_in_emails) do
        create(:user_email, email: keyword + generate(:email)).user.instance_users.last
      end

      subject { InstanceUser.search(keyword.downcase).to_a }
      it 'finds the instance_user' do
        expect(subject.count(instance_user_with_keyword_in_username)).to eq(1)
        expect(subject.count(instance_user_with_keyword_in_emails)).to eq(1)
      end
    end
  end
end
