require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::ContainerCourseService do
  let(:instance) { create(:instance) }
  let(:admin) { create(:administrator) }

  describe '.find_or_create!' do
    it 'creates one container course for the instance, with an assessment category and tab' do
      ActsAsTenant.with_tenant(instance) do
        course = described_class.find_or_create!(instance: instance, creator: admin)
        expect(course).to be_a(Course)
        expect(course.instance).to eq(instance)
        expect(course.assessment_categories.first).to be_present
        expect(course.assessment_categories.first.tabs.first).to be_present
      end
    end

    it 'is idempotent — a second call returns the same course, creating no new one' do
      ActsAsTenant.with_tenant(instance) do
        first = described_class.find_or_create!(instance: instance, creator: admin)
        expect do
          second = described_class.find_or_create!(instance: instance, creator: admin)
          expect(second).to eq(first)
        end.not_to change { Course.count }
      end
    end
  end
end