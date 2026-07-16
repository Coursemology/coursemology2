# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:listing) { create(:course_assessment_marketplace_listing, published: true) }
    let(:published_assessment) { listing.assessment }

    subject { Ability.new(user, course, course_user) }

    context 'when the user is a system administrator' do
      let(:user) { create(:administrator) }
      let(:course_user) { nil }
      it { is_expected.to be_able_to(:publish_to_marketplace, build(:assessment)) }
    end

    context 'when the user is a course manager' do
      let(:course_user) { create(:course_manager, course: course) }
      let(:user) { course_user.user }
      before { create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: user) }

      it { is_expected.to be_able_to(:access_marketplace, course) }
      it { is_expected.not_to be_able_to(:publish_to_marketplace, build(:assessment)) }
      it { is_expected.to be_able_to(:duplicate_from_marketplace, published_assessment) }
      it { is_expected.to be_able_to(:preview_in_marketplace, published_assessment) }

      it 'cannot duplicate/preview an unpublished listing' do
        unpublished = create(:course_assessment_marketplace_listing, published: false).assessment
        expect(subject).not_to be_able_to(:duplicate_from_marketplace, unpublished)
        expect(subject).not_to be_able_to(:preview_in_marketplace, unpublished)
      end
    end

    context 'when the user is a course student' do
      let(:course_user) { create(:course_student, course: course) }
      let(:user) { course_user.user }
      it { is_expected.not_to be_able_to(:access_marketplace, course) }
    end
  end
end
