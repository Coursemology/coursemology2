# frozen_string_literal: true
require 'rails_helper'

RSpec.describe DuplicationTraceable::Course, type: :model do
  it { is_expected.to act_as(DuplicationTraceable) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:user) { create(:course_manager, course: course).user }

    subject do
      build(:duplication_traceable_course, course: nil, source: nil)
    end

    describe 'validations' do
      it 'validates the presence of a destination course' do
        expect(subject).to_not be_valid
        expect(subject.errors[:course]).not_to be_empty
      end
    end

    describe '#source and #source=' do
      it 'correctly reads and updates the source' do
        expect(subject.source).to be(nil)
        subject.source = course
        expect(subject.source).to eq(course)
      end
    end

    describe '.dependent_class' do
      it 'returns Course::Course' do
        expect(DuplicationTraceable::Course.dependent_class).to eq(Course.name)
      end
    end

    describe '.initialize_with_dest' do
      it 'creates an instance with the dest initialized' do
        traceable = DuplicationTraceable::Course.initialize_with_dest(course)
        expect(traceable.course).to eq(course)
      end

      it 'passes in the other options correctly' do
        traceable = DuplicationTraceable::Course.initialize_with_dest(course, creator: user)
        expect(traceable.creator).to eq(user)
      end
    end
  end
end
