require 'rails_helper'

RSpec.describe Course::ModuleHost, type: :controller do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe 'module preferences' do
      let(:course) { create(:course, instance: instance) }
      let(:module_host) { Course::ModuleHost.new(instance.settings, course.settings) }
      let(:default_enabled_modules) { Course::ModuleHost.modules.select(&:enabled_by_default?) }

      describe '#modules' do
        subject { module_host.modules }

        context 'without preferences' do
          it 'returns the default enabled modules' do
            expect(subject.count).to eq(default_enabled_modules.count)
            default_enabled_modules.each do |m|
              expect(subject.include?(m)).to be_truthy
            end
          end
        end

        context 'with preferences' do
          let(:sample_module) { default_enabled_modules.first }
          context 'disable a module in course' do
            before { course.settings(sample_module.key).enabled = false }

            it 'does not include the disabled module' do
              expect(subject.include?(sample_module)).to be_falsey
            end
          end

          context 'disable a module in instance' do
            before { instance.settings(sample_module.key).enabled = false }

            it 'does not include the disabled module' do
              expect(subject.include?(sample_module)).to be_falsey
            end
          end

          context 'enable a module' do
            before { course.settings(sample_module.key).enabled = true }

            it 'includes the disabled module' do
              expect(subject.include?(sample_module)).to be_truthy
            end
          end
        end
      end

      describe '#disabled_modules' do
        subject { module_host.disabled_modules }

        context 'without preferences' do
          it 'returns empty' do
            expect(subject).to eq([])
          end
        end

        context 'with preferences' do
          let(:sample_module) { default_enabled_modules.first }
          context 'disable a module' do
            before { course.settings(sample_module.key).enabled = false }

            it 'includes the disabled module' do
              expect(subject.include?(sample_module)).to be_truthy
            end
          end

          context 'enable a module' do
            before { course.settings(sample_module.key).enabled = true }

            it 'does not include the enabled module' do
              expect(subject.include?(sample_module)).to be_falsey
            end
          end
        end
      end
    end
  end
end
