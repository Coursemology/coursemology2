require 'rails_helper'

RSpec.describe Instance, type: :model do
  it { is_expected.to have_many(:instance_users) }
  it { is_expected.to have_many(:users).through(:instance_users) }
  it { is_expected.to have_many(:announcements).class_name(Instance::Announcement.name) }

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

  describe '.current' do
    let(:current_instance) { ActsAsTenant.current_tenant }

    it 'returns the current instance' do
      expect(Instance.current).to eq(current_instance)
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

  describe 'module preferences' do
    let(:instance) { create(:instance) }
    let(:all_modules) { Course::ModuleHost.modules }

    describe '#set_default_settings' do
      it 'initializes the default values' do
        all_modules.each do |m|
          expect(instance.settings(m.key).enabled).to eq m.enabled_by_default?
        end
      end
    end

    describe '#enabled_modules' do
      let(:enabled_modules) { instance.enabled_modules }

      context 'without preference' do
        it 'returns the default enabled modules' do
          default_enabled_modules = all_modules.select(&:enabled_by_default?)
          expect(enabled_modules.count).to eq default_enabled_modules.count
          default_enabled_modules.each do |m|
            expect(enabled_modules.include?(m)).to eq true
          end
        end
      end

      context 'with preference' do
        let(:sample_module) { all_modules.first }
        context 'disable a module' do
          before do
            instance.settings(sample_module.key).enabled = false
            instance.save
          end

          it 'does not include the disabled module' do
            expect(enabled_modules.include?(sample_module)).to eq false
          end
        end

        context 'enable a module' do
          before { instance.settings(sample_module.key).enabled = true }

          it 'includes the disabled module' do
            expect(enabled_modules.include?(sample_module)).to eq true
          end
        end
      end
    end

    describe '#disabled_modules' do
      let(:disabled_modules) { instance.disabled_modules }

      context 'without preference' do
        it 'returns the default disabled modules' do
          default_disabled_modules = all_modules.select { |m| !m.enabled_by_default? }
          expect(disabled_modules.count).to eq default_disabled_modules.count
          default_disabled_modules.each do |m|
            expect(disabled_modules.include?(m)).to eq true
          end
        end
      end

      context 'with preference' do
        let(:sample_module) { all_modules.first }
        context 'disable a module' do
          before { instance.settings(sample_module.key).enabled = false }

          it 'includes the disabled module' do
            expect(disabled_modules.include?(sample_module)).to eq true
          end
        end

        context 'enable a module' do
          before do
            instance.settings(sample_module.key).enabled = true
          end

          it 'does not include the enabled module' do
            expect(disabled_modules.include?(sample_module)).to eq false
          end
        end
      end
    end
  end
end
