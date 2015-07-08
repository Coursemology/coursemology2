require 'rails_helper'

RSpec.describe Course::ComponentHost, type: :controller do
  controller do
  end

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe 'component preferences' do
      let(:course) { create(:course, instance: instance) }
      let(:component_host) do
        Course::ComponentHost.new(instance.settings, course.settings, controller)
      end
      let(:default_enabled_components) do
        Course::ComponentHost.components.select(&:enabled_by_default?)
      end

      describe '#components' do
        subject { component_host.components }

        it 'includes instances of every enabled component' do
          expect(subject.map(&:class)).to contain_exactly(*component_host.enabled_components)
        end
      end

      describe '#enabled_components' do
        subject { component_host.enabled_components }

        context 'without preferences' do
          it 'returns the default enabled components' do
            expect(subject.count).to eq(default_enabled_components.count)
            default_enabled_components.each do |m|
              expect(subject.include?(m)).to be_truthy
            end
          end
        end

        context 'with preferences' do
          let(:sample_component) { default_enabled_components.first }
          context 'disable a component in course' do
            before { course.settings(sample_component.key).enabled = false }

            it 'does not include the disabled component' do
              expect(subject.include?(sample_component)).to be_falsey
            end
          end

          context 'disable a component in instance' do
            before { instance.settings(sample_component.key).enabled = false }

            it 'does not include the disabled component' do
              expect(subject.include?(sample_component)).to be_falsey
            end
          end

          context 'enable a component' do
            before { course.settings(sample_component.key).enabled = true }

            it 'includes the disabled component' do
              expect(subject.include?(sample_component)).to be_truthy
            end
          end
        end
      end

      describe '#disabled_components' do
        subject { component_host.disabled_components }

        context 'without preferences' do
          it 'returns empty' do
            expect(subject).to eq([])
          end
        end

        context 'with preferences' do
          let(:sample_component) { default_enabled_components.first }
          context 'disable a component' do
            before { course.settings(sample_component.key).enabled = false }

            it 'includes the disabled component' do
              expect(subject.include?(sample_component)).to be_truthy
            end
          end

          context 'enable a component' do
            before { course.settings(sample_component.key).enabled = true }

            it 'does not include the enabled component' do
              expect(subject.include?(sample_component)).to be_falsey
            end
          end
        end
      end

      describe '#sidebar_items' do
        it 'returns an empty array when no components included' do
          allow(component_host).to receive(:components).and_return([])
          expect(component_host.sidebar_items).to eq([])
        end
      end
    end
  end
end
