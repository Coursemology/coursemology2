# frozen_string_literal: true
require 'rails_helper'

RSpec.describe DuplicationTraceable::Assessment, type: :model do
  it { is_expected.to act_as(DuplicationTraceable) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:user) { create(:course_manager, course: course).user }
    let(:assessment) { create(:assessment, :published_with_mcq_question, course: course) }

    subject do
      build(:duplication_traceable_assessment, assessment: nil, source: nil)
    end

    describe 'validations' do
      it 'validates the presence of a destination assessment' do
        expect(subject).to_not be_valid
        expect(subject.errors[:assessment]).not_to be_empty
      end
    end

    describe '#source and #source=' do
      it 'correctly reads and updates the source' do
        expect(subject.source).to be(nil)
        subject.source = assessment
        expect(subject.source).to eq(assessment)
      end
    end

    describe '.dependent_class' do
      it 'returns Course::Assessment' do
        expect(DuplicationTraceable::Assessment.dependent_class).to eq(Course::Assessment.name)
      end
    end

    describe '.initialize_with_dest' do
      it 'creates an instance with the dest initialized' do
        traceable = DuplicationTraceable::Assessment.initialize_with_dest(assessment)
        expect(traceable.assessment).to eq(assessment)
      end

      it 'passes in the other options correctly' do
        traceable = DuplicationTraceable::Assessment.initialize_with_dest(assessment, creator: user)
        expect(traceable.creator).to eq(user)
      end
    end
  end
end
