require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::PreviewEnrolmentService do
  let(:instance) { create(:instance) }

  around { |ex| ActsAsTenant.with_tenant(instance) { ex.run } }

  let(:course) { create(:course, instance: instance) }
  let(:user) { create(:user) }

  describe '.ensure_manager!' do
    it 'enrols the user as a manager' do
      cu = described_class.ensure_manager!(course: course, user: user)
      expect(cu).to be_manager
      expect(cu.course).to eq(course)
      expect(cu.user).to eq(user)
    end

    it 'is idempotent — no duplicate CourseUser on a second call' do
      described_class.ensure_manager!(course: course, user: user)
      expect do
        described_class.ensure_manager!(course: course, user: user)
      end.not_to change { CourseUser.where(course: course, user: user).count }
    end
  end
end
