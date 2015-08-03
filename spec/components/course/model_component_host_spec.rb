require 'rails_helper'

RSpec.describe Course::ModelComponentHost do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course, instance: instance) }

    class self::DummyComponent
      include Course::ModelComponentHost::Component

      class << self
        attr_accessor :called
        @called = false
      end

      def self.after_course_create(_)
        @called = true
      end
    end

    describe 'Course Component Host' do
      subject { course }

      it 'invokes ::after_course_create on child components' do
        expect(self.class::DummyComponent.called).to be_truthy
      end
    end
  end
end
