# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Instance do
  it { is_expected.to have_many(:instance_users).dependent(:destroy) }
  it { is_expected.to have_many(:users).through(:instance_users) }
  it do
    is_expected.to have_many(:announcements).class_name(Instance::Announcement.name).
      dependent(:destroy)
  end
  it { is_expected.to have_many(:courses).dependent(:destroy) }

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

    context 'when saving instance without modifying host' do
      it 'does not validate the host' do
        expect(Instance.default.save).to be_truthy
      end
    end
  end

  describe '.default' do
    it 'returns the default instance' do
      default_instance = Instance.default
      expect(default_instance.host).to eq(Application.config.x.default_host)
      expect(default_instance.default?).to be_truthy
    end
  end

  describe '.order_for_display' do
    let!(:instances) { create_list(:instance, 2) }
    # Use a name that comes before 'Default'
    let!(:instance) { create(:instance, name: 'Abc') }

    it 'orders the default instance first, then alphabetically by name' do
      listing = Instance.order_for_display
      expect(listing.first).to eq Instance.default

      # Drop the 'Default' instance.
      listing = listing.drop(1)
      # Check that the rest of the names are ordered alphabetically.
      names = listing.map(&:name)
      expect(names.length).to be > 1
      expect(names.each_cons(2).all? { |a, b| a <= b }).to be_truthy
    end
  end

  describe '.find_tenant_by_host' do
    let(:instances) { create_list(:instance, 3) }

    it 'finds the correct tenant if the host is correct' do
      found_instance = Instance.find_tenant_by_host(instances.first.host)
      expect(found_instance).to eq(instances.first)
    end
  end

  describe '.find_tenant_by_host_or_default' do
    let(:instances) { create_list(:instance, 3) }

    it 'finds the correct tenant if the host is correct' do
      found_instance = Instance.find_tenant_by_host_or_default(instances.first.host)
      expect(found_instance).to eq(instances.first)
    end

    it 'defaults to the default host if the host is not found' do
      found_instance = Instance.find_tenant_by_host_or_default('some-website.com')
      expect(found_instance).to eq(Instance.default)
    end
  end

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '.course_count' do
      let!(:courses) { create_list(:course, 2, instance: instance) }
      subject { Instance.where(id: instance.id).calculated(:course_count).first }

      it 'shows the correct count' do
        expect(subject.course_count).to eq(courses.size)
      end

      context 'when viewing from another instance' do
        let(:new_instance) { create(:instance) }
        it 'shows the correct count' do
          ActsAsTenant.with_tenant(new_instance) do
            expect(subject.course_count).to eq(courses.size)
          end
        end
      end
    end

    describe '.user_count' do
      let!(:users) { create_list(:instance_user, 3, instance: instance) }
      subject { Instance.where(id: instance.id).calculated(:user_count).first }

      it 'shows the correct count' do
        expect(subject.user_count).to eq(users.size)
      end

      context 'when viewing from another instance' do
        let(:new_instance) { create(:instance) }
        it 'shows the correct count' do
          ActsAsTenant.with_tenant(new_instance) do
            expect(subject.user_count).to eq(users.size)
          end
        end
      end
    end
  end
end
