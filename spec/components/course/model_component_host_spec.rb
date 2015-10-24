require 'rails_helper'

RSpec.describe Course::ModelComponentHost do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course, instance: instance) }

    class self::DummyComponent
      include Course::ModelComponentHost::Component

      class_attribute :called
      self.called = 0

      def self.after_course_create(_)
        self.called += 1
      end
    end

    describe 'Course Component Host' do
      subject { course }

      it 'invokes ::after_course_create on child components' do
        expect do
          course
        end.to change { self.class::DummyComponent.called }.by(1)
      end
    end
  end
end
