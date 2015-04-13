require 'rails_helper'

RSpec.describe Course, type: :model do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    it { is_expected.to belong_to(:creator) }
    it { is_expected.to have_many(:course_users).inverse_of(:course).dependent(:destroy) }
    it { is_expected.to have_many(:users).through(:course_users) }
    it { is_expected.to have_many(:announcements).inverse_of(:course).dependent(:destroy) }

    it { is_expected.to validate_presence_of(:title) }

    context 'when course is created' do
      subject { Course.new }

      it { is_expected.not_to be_published }
      it { is_expected.not_to be_opened }
    end

    describe 'module preferences' do
      let(:course) { create(:course, instance: instance) }
      let(:all_modules) { instance.enabled_modules }

      describe '#set_default_settings' do
        it 'initializes the default values' do
          all_modules.each do |m|
            expect(course.settings(m.key).enabled).to eq m.enabled_by_default?
          end
        end
      end

      describe '#enabled_modules' do
        let(:enabled_modules) { course.enabled_modules }

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
          context 'disable a module in course' do
            before do
              course.settings(sample_module.key).enabled = false
              course.save
            end

            it 'does not include the disabled module' do
              expect(enabled_modules.include?(sample_module)).to eq false
            end
          end

          context 'disable a module in instance' do
            before do
              instance.settings(sample_module.key).enabled = false
              instance.save
            end

            it 'does not include the disabled module' do
              expect(enabled_modules.include?(sample_module)).to eq false
            end
          end

          context 'enable a module' do
            before do
              course.settings(sample_module.key).enabled = true
              course.save
            end

            it 'includes the disabled module' do
              expect(enabled_modules.include?(sample_module)).to eq true
            end
          end
        end
      end

      describe '#disabled_modules' do
        let(:disabled_modules) { course.disabled_modules }

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
            before do
              course.settings(sample_module.key).enabled = false
            end

            it 'includes the disabled module' do
              expect(disabled_modules.include?(sample_module)).to eq true
            end
          end

          context 'enable a module' do
            before do
              course.settings(sample_module.key).enabled = true
            end

            it 'does not include the enabled module' do
              expect(disabled_modules.include?(sample_module)).to eq false
            end
          end
        end
      end
    end
  end
end
