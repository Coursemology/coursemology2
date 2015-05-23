require 'rails_helper'

RSpec.describe Instance, type: :model do
  it { is_expected.to have_many(:instance_users) }
  it { is_expected.to have_many(:users).through(:instance_users) }
  it do
    is_expected.to have_many(:announcements).class_name(Instance::Announcement.name).
      order(valid_from: :desc)
  end
  it { is_expected.to have_many(:courses) }

  describe 'hostname validation' do
    context 'when hostname format is invalid' do
      hosts = ['example,com', 'www_.example.org', 'example_.org', 'example.org_',
               'example .org', 'example. org', 'example.org..']

      hosts.each do |invalid_host|
        context invalid_host do
          subject { build(:instance, host: invalid_host) }

          it { is_expected.not_to be_valid }
        end
      end
    end

    context 'when hostname format is valid' do
      hosts = ['example.ORG', 'www.example.org', 'ex-ample.org', 'example.org.sg']
      hosts.each do |valid_host|
        context valid_host do
          subject { build(:instance, host: valid_host) }

          it { is_expected.to be_valid }
        end
      end
    end

    context 'when hostname is too long' do
      subject { build(:instance, host: 'a' * 255 + '.com') }

      it { is_expected.not_to be_valid }
    end
  end

  describe '.default' do
    it 'returns the default instance' do
      default_instance = Instance.default
      expect(default_instance.host).to eq('*')
    end
  end

  describe '.find_tenant_by_host' do
    before do
      @instances = create_list(:instance, 3)
    end

    it 'finds the correct tenant if the host is correct' do
      first_instance = @instances[0]
      found_instance = Instance.find_tenant_by_host(first_instance.host)

      expect(found_instance).to eq(first_instance)
    end
  end
end
