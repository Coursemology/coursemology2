# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::AssessmentMarketplaceComponent do
  controller(Course::Controller) {} # rubocop:disable Lint/EmptyBlock

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    subject do
      controller.instance_variable_set(:@course, course)
      described_class.new(controller)
    end

    context 'when the user can access the marketplace (course manager)' do
      let(:user) { create(:course_manager, course: course).user }
      before do
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: user)
        controller_sign_in(controller, user)
      end

      it 'exposes an admin sidebar item pointing at the marketplace' do
        item = subject.sidebar_items.find { |i| i[:key] == :admin_marketplace }
        expect(item).to be_present
        expect(item[:type]).to eq(:admin)
        expect(item[:icon]).to eq(:marketplace)
        expect(item[:path]).to eq(course_marketplace_path(course))
      end
    end

    context 'when the user cannot access the marketplace (course student)' do
      let(:user) { create(:course_student, course: course).user }
      before { controller_sign_in(controller, user) }

      it 'exposes no sidebar item' do
        expect(subject.sidebar_items).to be_empty
      end
    end
  end
end
