# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace, type: :model do
  let!(:instance) { Instance.default }

  # Nothing rolls back here, so a leaked `everyone` rule from an earlier spec file would grant
  # `:access_marketplace` to the not-allow-listed users below. Same cleanup as access_list_query_spec.
  before do
    Course::Assessment::Marketplace::AllowlistRule.delete_all
    Course::Assessment::Marketplace::AccessBlock.delete_all
  end

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:listing) { create(:course_assessment_marketplace_listing, :versioned, published: true) }

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
      it { is_expected.to be_able_to(:duplicate_from_marketplace, listing) }
      it { is_expected.to be_able_to(:preview_in_marketplace, listing) }

      it 'cannot duplicate/preview an unpublished listing' do
        unpublished = create(:course_assessment_marketplace_listing, :versioned, published: false)
        expect(subject).not_to be_able_to(:duplicate_from_marketplace, unpublished)
        expect(subject).not_to be_able_to(:preview_in_marketplace, unpublished)
      end

      it 'authorizes a listing whose served snapshot sits in a course the user cannot reach' do
        remote = create(:course_assessment_marketplace_listing, :versioned, published: true)
        expect(subject).to be_able_to(:duplicate_from_marketplace, remote)
        expect(subject).to be_able_to(:preview_in_marketplace, remote)
      end
    end

    context 'when the user is a course student' do
      let(:course_user) { create(:course_student, course: course) }
      let(:user) { course_user.user }
      it { is_expected.not_to be_able_to(:access_marketplace, course) }
    end

    context 'when the user is a course manager but is not allow-listed' do
      let(:course_user) { create(:course_manager, course: course) }
      let(:user) { course_user.user }

      # Load-bearing at the ability level: without the explicit `cannot`, the blanket
      # `can :manage, Course` a manager holds would satisfy `:access_marketplace`.
      it { is_expected.not_to be_able_to(:access_marketplace, course) }
    end

    context 'when the user is an observer here but manages another course (person-level access)' do
      let(:course_user) { create(:course_observer, course: course) }
      let(:user) { course_user.user }
      before do
        create(:course_manager, course: create(:course), user: user)
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: user)
      end

      it { is_expected.to be_able_to(:access_marketplace, course) }
      it { is_expected.to be_able_to(:duplicate_from_marketplace, listing) }
      it { is_expected.to be_able_to(:preview_in_marketplace, listing) }
    end

    context 'when an allow-listed user manages no course at all' do
      let(:course_user) { create(:course_observer, course: course) }
      let(:user) { course_user.user }
      before { create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: user) }

      it { is_expected.not_to be_able_to(:access_marketplace, course) }
    end

    context 'when the user is an instance instructor who manages no course but is allow-listed' do
      let!(:course_user) { create(:course_observer, course: course) }
      let!(:user) { course_user.user }
      before do
        other_instance = create(:instance)
        ActsAsTenant.with_tenant(other_instance) do
          create(:instance_user, :instructor, user: user, instance: other_instance)
        end
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: user)
      end

      # Proves the second baseline branch: eligible via instance role, not via managing a course.
      it { is_expected.to be_able_to(:access_marketplace, course) }
    end

    context 'when the user is an instance instructor who manages no course and is not allow-listed' do
      let!(:course_user) { create(:course_observer, course: course) }
      let!(:user) { course_user.user }
      before do
        other_instance = create(:instance)
        ActsAsTenant.with_tenant(other_instance) do
          create(:instance_user, :instructor, user: user, instance: other_instance)
        end
      end

      it { is_expected.not_to be_able_to(:access_marketplace, course) }
    end

    context 'when an eligible, allow-listed manager is individually blocked' do
      let(:course_user) { create(:course_manager, course: course) }
      let(:user) { course_user.user }
      before do
        create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: user)
        create(:course_assessment_marketplace_access_block, user: user)
      end

      it { is_expected.not_to be_able_to(:access_marketplace, course) }

      it 'regains access once the block is removed' do
        Course::Assessment::Marketplace::AccessBlock.where(user_id: user.id).delete_all
        expect(Ability.new(user, course, course_user)).to be_able_to(:access_marketplace, course)
      end
    end

    context 'when the course is a preview (content-frozen) sandbox' do
      let(:course) { create(:course, preview: true) }
      let(:assessment) { create(:assessment, course: course) }

      context 'and the user is the previewer (a course manager)' do
        let(:course_user) { create(:course_manager, course: course) }
        let(:user) { course_user.user }

        it 'preserves the attempt + publish loop' do
          expect(subject).to be_able_to(:attempt, assessment)
          expect(subject).to be_able_to(:publish_grades, assessment)
        end

        it 'freezes the assessment content (no edit/delete)' do
          expect(subject).not_to be_able_to(:update, assessment)
          expect(subject).not_to be_able_to(:destroy, assessment)
        end

        it 'freezes question authoring' do
          expect(subject).not_to be_able_to(:create, Course::Assessment::Question::MultipleResponse)
        end

        it 'forbids deleting submissions in the sandbox' do
          expect(subject).not_to be_able_to(:delete_all_submissions, assessment)
        end
      end

      context 'and the user is a system administrator' do
        let(:user) { create(:administrator) }
        let(:course_user) { nil }

        it 'is exempt — retains full content management' do
          expect(subject).to be_able_to(:update, assessment)
          expect(subject).to be_able_to(:destroy, assessment)
        end
      end
    end

    context 'when a course manager is in a NON-preview course' do
      let(:course) { create(:course) }
      let(:assessment) { create(:assessment, course: course) }
      let(:course_user) { create(:course_manager, course: course) }
      let(:user) { course_user.user }

      it 'retains normal content management (the freeze is preview-scoped)' do
        expect(subject).to be_able_to(:update, assessment)
        expect(subject).to be_able_to(:destroy, assessment)
      end
    end
  end
end
